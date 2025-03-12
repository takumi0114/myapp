package plugins

import io.ktor.server.application.*
import io.ktor.server.routing.*
import routes.todoRoutes

fun Application.configureRouting() {
    routing {
      route("/api") {
        todoRoutes()
      }
    }
}