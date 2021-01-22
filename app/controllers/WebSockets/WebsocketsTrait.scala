package controllers.WebSockets

import scala.swing.Reactor
import akka.actor.Actor
import gamecontrol.supervisor.{ SupervisorInterface, supervisor }

trait WebsocketsTrait extends Actor with Reactor {
  def sendJson(): Unit
}
