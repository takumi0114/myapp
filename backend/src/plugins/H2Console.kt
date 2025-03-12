// import io.ktor.server.application.*
// import io.ktor.server.plugins.httpsredirect.*
// import io.ktor.server.routing.*
// import org.h2.server.web.WebServlet
// import io.ktor.server.servlet.ServletApplicationEngine

// fun Application.configureH2Console() {
//     install(ServletApplicationEngine) {
//         register(WebServlet().apply {
//             init()
//         }, "/h2-console/*")
//     }
// }