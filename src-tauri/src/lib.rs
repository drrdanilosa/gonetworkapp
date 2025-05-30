use std::fs;
use std::path::Path;
use serde::Serialize;

// Estrutura para informações do sistema
#[derive(Serialize)]
pub struct SystemInfo {
    os: String,
    arch: String,
    version: String,
    hostname: String,
}

// Comando personalizado para saudar o usuário
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Olá, {}! Bem-vindo ao GoNetworkApp!", name)
}

// Comando para obter informações do sistema
#[tauri::command]
fn get_platform() -> String {
    std::env::consts::OS.to_string()
}

#[tauri::command]
fn get_arch() -> String {
    std::env::consts::ARCH.to_string()
}

// Comando para obter informações completas do sistema
#[tauri::command]
fn get_system_info() -> Result<SystemInfo, String> {
    let hostname = hostname::get()
        .map_err(|e| format!("Erro ao obter hostname: {}", e))?
        .to_string_lossy()
        .to_string();

    Ok(SystemInfo {
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        version: std::env::consts::FAMILY.to_string(),
        hostname,
    })
}

// Comando para verificar se um arquivo existe
#[tauri::command]
fn file_exists(path: String) -> bool {
    Path::new(&path).exists()
}

// Comando para ler arquivo de texto
#[tauri::command]
fn read_text_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path)
        .map_err(|e| format!("Erro ao ler arquivo '{}': {}", path, e))
}

// Comando para escrever arquivo de texto
#[tauri::command]
fn write_text_file(path: String, content: String) -> Result<(), String> {
    fs::write(&path, content)
        .map_err(|e| format!("Erro ao escrever arquivo '{}': {}", path, e))
}

// Comando para criar diretório
#[tauri::command]
fn create_directory(path: String) -> Result<(), String> {
    fs::create_dir_all(&path)
        .map_err(|e| format!("Erro ao criar diretório '{}': {}", path, e))
}

// Comando para listar arquivos em um diretório
#[tauri::command]
fn list_directory(path: String) -> Result<Vec<String>, String> {
    let entries = fs::read_dir(&path)
        .map_err(|e| format!("Erro ao ler diretório '{}': {}", path, e))?;

    let mut files = Vec::new();
    for entry in entries {
        let entry = entry.map_err(|e| format!("Erro ao processar entrada: {}", e))?;
        let path = entry.path();
        if let Some(name) = path.file_name() {
            if let Some(name_str) = name.to_str() {
                files.push(name_str.to_string());
            }
        }
    }
    
    files.sort();
    Ok(files)
}

// Comando para obter informações de um arquivo
#[derive(Serialize)]
pub struct FileInfo {
    name: String,
    size: u64,
    is_file: bool,
    is_dir: bool,
    modified: Option<String>,
}

#[tauri::command]
fn get_file_info(path: String) -> Result<FileInfo, String> {
    let path = Path::new(&path);
    let metadata = path.metadata()
        .map_err(|e| format!("Erro ao obter metadados: {}", e))?;

    let modified = metadata.modified()
        .ok()
        .and_then(|time| {
            time.duration_since(std::time::UNIX_EPOCH)
                .ok()
                .map(|duration| duration.as_secs().to_string())
        });

    Ok(FileInfo {
        name: path.file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("Unknown")
            .to_string(),
        size: metadata.len(),
        is_file: metadata.is_file(),
        is_dir: metadata.is_dir(),
        modified,
    })
}

pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
        greet, 
        get_platform, 
        get_arch,
        get_system_info,
        file_exists,
        read_text_file,
        write_text_file,
        create_directory,
        list_directory,
        get_file_info
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
