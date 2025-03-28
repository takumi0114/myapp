package plugins

import models.*
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction
import io.ktor.server.application.*

fun Application.configureDatabases() {
    val database = Database.connect(
        url = "jdbc:h2:file:./build/db/goodhabit",
        driver = "org.h2.Driver"
    )
    
    transaction(database) {
        SchemaUtils.create(Habits)  // インポートしたモデルのテーブルを作成
        SchemaUtils.create(HabitAchievements)
        // ここが存在していなかったのでテーブル作成できなかった、その後に再起動
        SchemaUtils.create(HabitDetails)
    }
}