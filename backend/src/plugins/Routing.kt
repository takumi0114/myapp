package plugins

import io.ktor.server.application.*
import io.ktor.server.routing.*
import routes.habitRoutes

fun Application.configureRouting() {
    routing {
        habitRoutes()     
    }
}