package controllers.WebSockets

import akka.actor.{ Actor, ActorRef }
import gamecontrol.supervisor.SupervisorInterface
import play.api.libs.json.{ JsValue, Json }
import controllers.GameController
import gamecontrol.{ CardChangedEvent, NewRoundEvent }
case class SquarecastleWebsocketactor(out: ActorRef, gamecontroller: GameController) extends WebsocketsTrait {
  listenTo(gamecontroller.supervisor)
  reactions += {
    case event: CardChangedEvent => sendJson()
    case event: NewRoundEvent => sendJson()
  }

  override def receive: Actor.Receive = {
    case msg: JsValue => {
      val data = gamecontroller.readCommand(msg)
      if (data != "init")
        gamecontroller.clicked(data)
    }
  }
  override def sendJson(): Unit = {
    out ! gamecontroller.sendControllerOutput()
  }
}
