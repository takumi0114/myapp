package routes

import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.request.*
import io.ktor.server.routing.*
import io.ktor.http.*
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.SortOrder
import plugins.Todo
import plugins.Todos
import models.TodoDTO
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

fun Route.todoRoutes() {
    route("/todos") {
        // 全てのTodoを取得
        get {
            val todos = transaction {
                Todo.all().orderBy(Todos.id to SortOrder.ASC).map { it.toDTO() }
            }
            call.respond(todos)
        }
        
        // IDでTodoを取得
        get("{id}") {
            val id = call.parameters["id"]?.toIntOrNull()
            if (id == null) {
                call.respond(HttpStatusCode.BadRequest, "Invalid ID")
                return@get
            }
            
            val todo = transaction {
                Todo.findById(id)?.toDTO()
            }
            
            if (todo != null) {
                call.respond(todo)
            } else {
                call.respond(HttpStatusCode.NotFound, "Todo not found")
            }
        }
        
        // 新しいTodoを作成
        post {
            val todoDTO = call.receive<TodoDTO>()
            val todoId = transaction {
                Todo.new {
                    title = todoDTO.title
                    description = todoDTO.description
                    completed = todoDTO.completed
                    priority = todoDTO.priority
                }.id.value
            }
            
            // IDを使って作成したTodoを取得
            val createdTodo = transaction {
                Todo.findById(todoId)?.toDTO()
            }
            
            if (createdTodo != null) {
                call.respond(HttpStatusCode.Created, createdTodo)
            } else {
                call.respond(HttpStatusCode.InternalServerError, "Failed to create todo")
            }
        }
        
        // Todoを更新
        put("{id}") {
            val id = call.parameters["id"]?.toIntOrNull()
            if (id == null) {
                call.respond(HttpStatusCode.BadRequest, "Invalid ID")
                return@put
            }
            
            val todoDTO = call.receive<TodoDTO>()
            val updated = transaction {
                val todo = Todo.findById(id)
                if (todo != null) {
                    todo.title = todoDTO.title
                    todo.description = todoDTO.description
                    todo.completed = todoDTO.completed
                    todo.priority = todoDTO.priority
                    true
                } else {
                    false
                }
            }
            
            if (updated) {
                call.respond(HttpStatusCode.OK, "Todo updated")
            } else {
                call.respond(HttpStatusCode.NotFound, "Todo not found")
            }
        }
        
        // Todoを削除
        delete("{id}") {
            val id = call.parameters["id"]?.toIntOrNull()
            if (id == null) {
                call.respond(HttpStatusCode.BadRequest, "Invalid ID")
                return@delete
            }
            
            val deleted = transaction {
                val todo = Todo.findById(id)
                todo?.delete()
                todo != null
            }
            
            if (deleted) {
                call.respond(HttpStatusCode.OK, "Todo deleted")
            } else {
                call.respond(HttpStatusCode.NotFound, "Todo not found")
            }
        }
        
        // ステータスの変更（完了/未完了の切り替え）
        patch("{id}/toggle") {
            val id = call.parameters["id"]?.toIntOrNull()
            if (id == null) {
                call.respond(HttpStatusCode.BadRequest, "Invalid ID")
                return@patch
            }
            
            val updated = transaction {
                val todo = Todo.findById(id)
                if (todo != null) {
                    todo.completed = !todo.completed
                    true
                } else {
                    false
                }
            }
            
            if (updated) {
                call.respond(HttpStatusCode.OK, "Todo status toggled")
            } else {
                call.respond(HttpStatusCode.NotFound, "Todo not found")
            }
        }
    }
}

// TodoエンティティからDTOへの変換拡張関数
fun Todo.toDTO(): TodoDTO {
    return TodoDTO(
        id = id.value,
        title = title,
        description = description,
        completed = completed,
    )
}