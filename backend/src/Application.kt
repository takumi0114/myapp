import io.ktor.server.application.*
import plugins.*

fun main(args: Array<String>): Unit = io.ktor.server.netty.EngineMain.main(args)

fun Application.module() {
    configureSerialization()
    configureCors()
    configureDatabases()     // データベース設定
    configureRouting()       // ルーティング設定
}