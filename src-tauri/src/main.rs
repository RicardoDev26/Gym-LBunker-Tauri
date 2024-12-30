use std::sync::{Arc, Mutex};
use chrono::{Duration, Utc};
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use tauri::State;
use uuid::Uuid;
use std::{thread};
use cron::Schedule;
use std::str::FromStr;

struct AppState {
    conn: Arc<Mutex<Connection>>,
}

impl Clone for AppState {
    fn clone(&self) -> Self {
        AppState {
            conn: Arc::clone(&self.conn),
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
struct Usuario {
    id: i32,
    nombre: String,
    uuid: String,
    fecha_inicio: Option<String>,
    fecha_pago: String,
    fecha_corte: String,
    estado: String,
    dias_restantes: i32,
    membresia: String,
    foto: Option<String>,
}

// Inicializa la base de datos creando la tabla de usuarios
fn inicializar_bd(conn: &Connection) -> Result<(), String> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            uuid TEXT NOT NULL,
            fecha_inicio TEXT,
            fecha_pago TEXT NOT NULL,
            fecha_corte TEXT NOT NULL,
            estado TEXT NOT NULL CHECK (estado IN('activo', 'inactivo', 'cancelado')),
            dias_restantes INTEGER,
            membresia TEXT NOT NULL CHECK (membresia IN('Sin membresia', 'Premium')),
            foto TEXT
        );",
        [],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn agregar_usuario(
    state: State<AppState>,
    nombre: String,
    duracion_visita: i32,
    foto: Option<String>,
) -> Result<String, String> {
    let conn = state.conn.lock().unwrap();
    let uuid = &Uuid::new_v4().to_string()[..5];
    let fecha_actual = Utc::now().naive_utc().date();
    let fecha_pago = fecha_actual;
    let fecha_corte = fecha_pago + Duration::days(duracion_visita as i64);
    let dias_restantes = (fecha_corte - fecha_actual).num_days();
    let membresia = if duracion_visita >= 30 { "Premium" } else { "Sin membresia" };
    let fecha_inicio = if membresia == "Premium" {
        Some(fecha_actual.to_string())
    } else {
        None
    };

    println!(
        "Datos del usuario: nombre={}, uuid={}, fecha_inicio={:?}, fecha_pago={}, fecha_corte={}, estado=activo, dias_restantes={}, membresia={}, foto={:?}",
        nombre, uuid, fecha_inicio, fecha_pago, fecha_corte, dias_restantes, membresia, foto
    );

    match conn.execute(
        "INSERT INTO usuarios (nombre, uuid, fecha_inicio, fecha_pago, fecha_corte, estado, dias_restantes, membresia, foto) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9);",
        params![
            nombre,
            uuid,
            fecha_inicio,
            fecha_pago.to_string(),
            fecha_corte.to_string(),
            "activo",
            dias_restantes,
            membresia,
            foto,
        ],
    ) {
        Ok(_) => Ok("Usuario agregado correctamente".to_string()),
        Err(e) => {
            eprintln!("Error al agregar usuario: {}", e);
            Err(e.to_string())
        }
    }
}

#[tauri::command]
fn renovar_mensualidad(
    state: State<AppState>,
    usuario_id: i32,
    duracion_renovacion: i32,
) -> Result<String, String> {
    let conn = state.conn.lock().unwrap();
    let fecha_actual = Utc::now().naive_utc().date();
    let nueva_fecha_corte = fecha_actual + Duration::days(duracion_renovacion as i64);
    let nuevos_dias_restantes = (nueva_fecha_corte - fecha_actual).num_days();

    // Obtener el estado actual del usuario
    let mut stmt = conn.prepare("SELECT membresia, fecha_inicio FROM usuarios WHERE id = ?1;").map_err(|e| e.to_string())?;
    let (membresia, fecha_inicio): (String, Option<String>) = stmt.query_row(params![usuario_id], |row| {
        Ok((row.get(0)?, row.get(1)?))
    }).map_err(|e| e.to_string())?;

    let nueva_membresia = if membresia == "Sin membresia" && duracion_renovacion >= 30 {
        "Premium"
    } else {
        &membresia
    }.to_string();

    let nueva_fecha_inicio = if nueva_membresia == "Premium" && membresia == "Sin membresia" {
        Some(fecha_actual.to_string())
    } else {
        fecha_inicio
    };

    match conn.execute(
        "UPDATE usuarios SET fecha_pago = ?1, fecha_corte = ?2, dias_restantes = ?3, membresia = ?4, estado = 'activo', fecha_inicio = ?5 WHERE id = ?6",
        params![
            fecha_actual.to_string(),
            nueva_fecha_corte.to_string(),
            nuevos_dias_restantes,
            nueva_membresia,
            nueva_fecha_inicio,
            usuario_id,
        ],
    ) {
        Ok(_) => Ok("Mensualidad renovada correctamente".to_string()),
        Err(e) => {
            eprintln!("Error al renovar mensualidad: {}", e);
            Err(e.to_string())
        }
    }
}

#[tauri::command]
fn renovar_membresia(
    state: State<AppState>,
    usuario_id: i32,
) -> Result<String, String> {
    let conn = state.conn.lock().unwrap();
    let fecha_actual = Utc::now().naive_utc().date();
    let nueva_fecha_inicio = fecha_actual;
    let nueva_fecha_corte_membresia = fecha_actual + Duration::days(365);
    let nueva_fecha_corte_mensualidad = fecha_actual + Duration::days(30);
    let nuevos_dias_restantes_mensualidad = (nueva_fecha_corte_mensualidad - fecha_actual).num_days();

    match conn.execute(
        "UPDATE usuarios SET fecha_inicio = ?1, fecha_pago = ?2, fecha_corte = ?3, dias_restantes = ?4, membresia = 'Premium', estado = 'activo' WHERE id = ?5",
        params![
            nueva_fecha_inicio.to_string(),
            fecha_actual.to_string(),
            nueva_fecha_corte_mensualidad.to_string(),
            nuevos_dias_restantes_mensualidad,
            usuario_id,
        ],
    ) {
        Ok(_) => Ok("Membresía renovada correctamente".to_string()),
        Err(e) => {
            eprintln!("Error al renovar membresía: {}", e);
            Err(e.to_string())
        }
    }
}

#[tauri::command]
fn cambiar_foto_usuario(
    state: State<AppState>,
    usuario_id: i32,
    foto: String,
) -> Result<String, String> {
    let conn = state.conn.lock().unwrap();
    
    match conn.execute(
        "UPDATE usuarios SET foto = ?1 WHERE id = ?2",
        params![foto, usuario_id],
    ) {
        Ok(_) => Ok("Foto actualizada correctamente".to_string()),
        Err(e) => {
            eprintln!("Error al actualizar la foto: {}", e);
            Err(e.to_string())
        }
    }
}

#[tauri::command]
fn obtener_usuarios(state: State<AppState>) -> Result<Vec<Usuario>, String> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn.prepare("SELECT id, nombre, uuid, fecha_inicio, fecha_pago, fecha_corte, estado, dias_restantes, membresia, foto FROM usuarios;")
        .map_err(|e| e.to_string())?;
    let usuarios = stmt.query_map([], |row| {
        Ok(Usuario {
            id: row.get(0)?,
            nombre: row.get(1)?,
            uuid: row.get(2)?,
            fecha_inicio: row.get(3)?,
            fecha_pago: row.get(4)?,
            fecha_corte: row.get(5)?,
            estado: row.get(6)?,
            dias_restantes: row.get(7)?,
            membresia: row.get(8)?,
            foto: row.get(9)?,
        })
    })
    .map_err(|e| e.to_string())?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| e.to_string())?;

    println!("Usuarios obtenidos: {:?}", usuarios);
    Ok(usuarios)
}

#[tauri::command]
fn obtener_usuario_por_uuid(state: State<AppState>, uuid: String) -> Result<Usuario, String> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn.prepare("SELECT id, nombre, uuid, fecha_inicio, fecha_pago, fecha_corte, estado, dias_restantes, membresia, foto FROM usuarios WHERE uuid = ?1;")
        .map_err(|e| e.to_string())?;
    
    match stmt.query_row(params![uuid], |row| {
        Ok(Usuario {
            id: row.get(0)?,
            nombre: row.get(1)?,
            uuid: row.get(2)?,
            fecha_inicio: row.get(3)?,
            fecha_pago: row.get(4)?,
            fecha_corte: row.get(5)?,
            estado: row.get(6)?,
            dias_restantes: row.get(7)?,
            membresia: row.get(8)?,
            foto: row.get(9)?,
        })
    }) {
        Ok(usuario) => Ok(usuario),
        Err(_) => Err("Usuario no encontrado".to_string()),
    }
}

fn actualizar_dias_restantes(state: &AppState) -> Result<(), String> {
    let conn = state.conn.lock().unwrap();

    // Disminuir los días restantes para usuarios activos
    conn.execute(
        "UPDATE usuarios SET dias_restantes = dias_restantes - 1 WHERE estado = 'activo' AND dias_restantes > 0",
        [],
    ).map_err(|e| e.to_string())?;

    // Cambiar estado a 'inactivo' si los días restantes llegan a 0
    conn.execute(
        "UPDATE usuarios SET estado = 'inactivo' WHERE estado = 'activo' AND dias_restantes <= 0",
        [],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn actualizar_estado_usuarios(state: State<AppState>) -> Result<(), String> {
    let conn = state.conn.lock().unwrap();

    conn.execute(
        "UPDATE usuarios SET estado = 'inactivo' WHERE estado = 'activo' AND dias_restantes = 0",
        params![],
    ).map_err(|e| e.to_string())?;

    let seis_meses = Duration::days(180);
    conn.execute(
        "UPDATE usuarios SET estado = 'cancelado', membresia = 'Sin membresia' WHERE estado = 'inactivo' AND julianday('now') - julianday(fecha_pago) >= ?1",
        params![seis_meses.num_days()],
    ).map_err(|e| e.to_string())?;

    let un_anio = Duration::days(365);
    conn.execute(
        "UPDATE usuarios SET estado = 'cancelado', membresia = 'Sin membresia' WHERE membresia = 'Premium' AND julianday('now') - julianday(fecha_inicio) >= ?1",
        params![un_anio.num_days()],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

fn main() {
    let conn = Connection::open("gimnasio.db").expect("No se puede abrir la base de datos");
    inicializar_bd(&conn).expect("No se pudo inicializar la base de datos");

    let state = AppState {
        conn: Arc::new(Mutex::new(conn)),
    };

    // Configurar el cron job
    let schedule = Schedule::from_str("0 0 0 * * *").unwrap(); // Ejecutar cada día a medianoche UTC
    let state_clone = state.clone(); // Clonamos el estado
    thread::spawn(move || {
        for datetime in schedule.upcoming(Utc) {
            let now = Utc::now();
            let duration = datetime - now;
            thread::sleep(duration.to_std().unwrap());
            let _ = actualizar_dias_restantes(&state_clone);
        }
    });

    tauri::Builder::default()
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            agregar_usuario,
            actualizar_estado_usuarios,
            renovar_mensualidad,
            renovar_membresia,
            cambiar_foto_usuario,
            obtener_usuarios,
            obtener_usuario_por_uuid,
        ])
        .run(tauri::generate_context!())
        .expect("Error al ejecutar la aplicación de Tauri");
}