package controllers

import akka.actor.{ ActorSystem, Props }
import _root_.controllers.WebSockets.SquarecastleWebsocketactor
import akka.stream.Materializer
import com.mohiva.play.silhouette.api.Silhouette
import com.mohiva.play.silhouette.api.actions.SecuredRequest
import com.mohiva.play.silhouette.impl.providers.GoogleTotpInfo
import play.api.Play.materializer
import play.api.mvc.Result
import utils.auth.DefaultEnv

import scala.concurrent.ExecutionContext

//import controllers
// .WebSockets.SquarecastleWebsocketactor
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.scala.ScalaObjectMapper
import gamecontrol.supervisor.{ SupervisorInterface, supervisor }
import gamecontrol.controller.{ Controller, ControllerInterface }
import gamemodel.model.PlayerComponent.Player
import akka.actor.{ ActorSystem, _ }
import javax.inject.Inject
import play.api.mvc.{ AbstractController, Action, AnyContent, ControllerComponents, Request, WebSocket }
import play.api.i18n.I18nSupport
import play.api.libs.json.{ JsArray, JsObject, JsPath, JsString, JsValue, Json, Writes }
import play.api.libs.streams.ActorFlow

import scala.swing.Reactor

class GameController @Inject() (
  scc: SilhouetteControllerComponents,
  about: views.html.rules,
  playersettings: views.html.playerSettings,
  index: views.html.index,
  signin: views.html.home,
  game: views.html.squarecastle,
  silhouette: Silhouette[DefaultEnv]
)(implicit ex: ExecutionContext, system: ActorSystem, mat: Materializer) extends SilhouetteController(scc) {

  var supervisor: SupervisorInterface = scala.main.supervisor
  var controller: ControllerInterface = scala.main.Controller
  supervisor.controller = controller
  var str: String = ""
  var player1name = ""
  var player2name = ""
  var player1color = ""
  var player2color = ""
  var player1points = ""
  var player2points = ""
  //this.listenTo(controller)
  //reactions += {
  //  case event: InsertedEvent =>
  //      this.send(supervisor)

  //}

  def squarecastle(s: String): Action[AnyContent] = SecuredAction.async { implicit request: SecuredRequest[EnvType, AnyContent] =>
    supervisor = scala.main.supervisor
    controller = scala.main.Controller
    supervisor.controller = controller
    supervisor.firstround = true;
    addplayers(s.charAt(0).toString, s.charAt(1).toString)
    supervisor.testfall();
    supervisor.newRound()

    authInfoRepository.find[GoogleTotpInfo](request.identity.loginInfo).map { totpInfoOpt =>
      Ok(game(supervisor.controller.ImagePath(supervisor.card, supervisor.card), supervisor, player1color, player2color, player1name, player2name, request.identity, totpInfoOpt))
    }
  }
  def playerSettings: Action[AnyContent] = SecuredAction.async { implicit request: SecuredRequest[EnvType, AnyContent] =>
    supervisor = scala.main.supervisor
    controller = scala.main.Controller
    supervisor.controller = controller
    supervisor.firstround = true;
    authInfoRepository.find[GoogleTotpInfo](request.identity.loginInfo).map { totpInfoOpt =>
      Ok(playersettings(request.identity, totpInfoOpt))
    }
  }

  def rules: Action[AnyContent] = SecuredAction.async { implicit request: SecuredRequest[EnvType, AnyContent] =>
    authInfoRepository.find[GoogleTotpInfo](request.identity.loginInfo).map { totpInfoOpt =>
      Ok(about(request.identity, totpInfoOpt))
    }
  }
  def signIn: Action[AnyContent] = SecuredAction.async { implicit request: SecuredRequest[EnvType, AnyContent] =>
    authInfoRepository.find[GoogleTotpInfo](request.identity.loginInfo).map { totpInfoOpt =>
      Ok(signin(request.identity, totpInfoOpt))
    }
  }
  def home: Action[AnyContent] = SecuredAction.async { implicit request: SecuredRequest[EnvType, AnyContent] =>
    authInfoRepository.find[GoogleTotpInfo](request.identity.loginInfo).map { totpInfoOpt =>
      Ok(index(request.identity, totpInfoOpt))
    }
  }

  def JsonCommand = Action(parse.json) {
    request: Request[JsValue] =>
      {
        val data = readCommand(request.body)
        if (data != "init")
          clicked(data)
        Ok(sendControllerOutput()).withHeaders("Acces-Control-Allow-Origin" -> "http://localhost:8080")

      }
  }

  var Controllerstate = 0;
  var layedX = -1;
  var layedY = -1;
  def sendControllerOutput(): JsValue = {
    //eventuelle Ereignisse als int code
    //'{ "name": "Georg", "alter": 47, "verheiratet": false, "beruf": null}'
    val data = Array.ofDim[String](8)
    data(0) = Controllerstate.toString
    data(1) = supervisor.controller.ImagePath(supervisor.card, supervisor.card)
    if (layedX != -1 && layedY != -1)
      data(2) = supervisor.controller.ImagePath(supervisor.map.field(layedX)(layedY), supervisor.map.field(layedX)(layedY))
    if (supervisor.playersturn != null)
      data(3) = supervisor.playersturn.toString
    if (supervisor.p1 != null) {
      data(4) = supervisor.p1.getPoints().toString
      player1points = data(4)
    }
    if (supervisor.p2 != null) {
      data(5) = supervisor.p2.getPoints().toString
      player1points = data(5)
    }
    data(6) = supervisor.newpoints.toString
    if (supervisor.playersturn != null && supervisor.playersturn.toString == player1name)
      data(7) = player1color
    else if (supervisor.playersturn != null && supervisor.playersturn.toString == player2name)
      data(7) = player2color
    val jsonArray = Json.toJson(Seq(
      toJson(data(0)), toJson(data(1)), toJson(data(2)), toJson(data(3)), toJson(data(4)), toJson(data(5)), toJson(data(6)), toJson(data(7))
    ))
    jsonArray
  }

  def toJson(value: Any): String = {
    val JacksMapper = new ObjectMapper() with ScalaObjectMapper
    JacksMapper.writeValueAsString(value)
  }
  def SendController = Action(parse.json) {
    Ok(sendControllerOutput()).withHeaders("Acces-Control-Allow-Origin" -> "http://localhost:8080")
  }
  def readCommand(value: JsValue): (String) = {
    val instruction = (value \ "instruction").get.toString.replace("\"", "")
    if (instruction == "0") {
      val x = (value \ "x").get.toString.replace("\"", "");
      val y = (value \ "y").get.toString().replace("\"", "");
      layedX = x.toInt;
      layedY = y.toInt;
      return "i " + x + " " + y
    }
    if (instruction == "setPlayers") {
      val player1 = (value \ "x").get.toString.replace("\"", "")
      val player2 = (value \ "y").get.toString.replace("\"", "")
      addplayers(player1, player2)
      return "init"
    }
    instruction
  }
  def addplayers(player1: String, player2: String): Unit = {
    player1 match {
      case "0" =>
        player1name = "Sir Bors"
        player1color = "blue"
      case "1" =>
        player1name = "King Ludwig"
        player1color = "red"
      case "2" =>
        player1name = "Boltar"
        player1color = "green"
      case "3" =>
        player1name = "Arokh"
        player1color = "purple"
      case _ => println("Fehler bei der Spielerindex erkennung")

    }
    player2 match {
      case "0" =>
        player2name = "Sir Bors"
        player2color = "blue"
      case "1" =>
        player2name = "King Ludwig"
        player2color = "red"
      case "2" =>
        player2name = "Boltar"
        player2color = "green"
      case "3" =>
        player2name = "Arokh"
        player2color = "purple"
      case _ => println("Fehler bei der Spielerindex erkennung")
    }
    supervisor.p1 = new Player(player1name)
    supervisor.p2 = new Player(player2name)
    println(player1color + ": " + supervisor.p1 + " " + player2color + ": " + supervisor.p2)
  }
  def clicked(befehl: String): Unit = {
    controller.befehl = befehl
    println(befehl)
    println("firstround: " + supervisor.firstround)
    Controllerstate = supervisor.newRoundactive()
    if (Controllerstate != 2) {
      supervisor.otherplayer()
      supervisor.newRound()
    }
    //update website
  }
  // def socket = new SquarecastleWebsocketactor(out,supervisor,this)
  def socket = WebSocket.accept[JsValue, JsValue] { request =>
    ActorFlow.actorRef { out =>
      Props(SquarecastleWebsocketactor(out, this))
    }
  }
}
