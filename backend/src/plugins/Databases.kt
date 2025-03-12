package plugins

import io.ktor.server.application.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.dao.IntEntity
import org.jetbrains.exposed.dao.IntEntityClass
import org.jetbrains.exposed.dao.id.EntityID
import java.time.LocalDateTime

// Todoテーブル定義
object Todos : IntIdTable() {
    val title = varchar("title", 100)
    val description = text("description").nullable()
    val completed = bool("completed").default(false)
    val priority = integer("priority").default(1)
}

// TodoのDAOクラス
class Todo(id: EntityID<Int>) : IntEntity(id) {
    companion object : IntEntityClass<Todo>(Todos)
    var title by Todos.title
    var description by Todos.description
    var completed by Todos.completed
    var priority by Todos.priority
}

fun Application.configureDatabases() {
    // データベース接続を初期化
    Database.connect(
        url = "jdbc:h2:file:./build/todoapp",
        driver = "org.h2.Driver"
    )
    
    // テーブルの作成
    transaction {
        SchemaUtils.create(Todos)
    }
}