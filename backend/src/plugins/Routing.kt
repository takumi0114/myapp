package plugins

import io.ktor.server.application.*
import io.ktor.server.routing.*
import io.ktor.server.http.content.*
import routes.habitRoutes

fun Application.configureRouting() {
    routing {
        habitRoutes()
        
        static("/uploads") {
            files("uploads") 
        }
    }
}