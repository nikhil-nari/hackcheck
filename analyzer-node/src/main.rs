use tokio::process::Command;
use std::process::Stdio;
use tokio::io::{BufReader, AsyncBufReadExt};
use std::fs::File;
use std::io::Write;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let target_url = "https://example.com";
    let log_path = "detonation_trace.asm";
    let mut file = File::create(log_path)?;

    println!("🚀 Launching Detonation Chamber for: {}", target_url);

    // We launch via 'Command' to ensure Arch finds it in the PATH
    let mut child = Command::new("chromium") 
        .args([
            "--headless",
            "--no-sandbox",
            "--disable-gpu",
            "--js-flags=--print-bytecode", 
            target_url,
        ])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped()) // Bytecode dumps to stderr
        .spawn()?;

    let stderr = child.stderr.take().unwrap();
    let mut reader = BufReader::new(stderr).lines();

    println!("🕵️ Intercepting V8 Bytecode Firehose...");

    let mut line_count = 0;
    // Capture the stream and write to our .asm file
    while let Ok(Some(line)) = reader.next_line().await {
        writeln!(file, "{}", line)?;
        line_count += 1;
        
        if line_count % 500 == 0 {
            println!("📥 Captured {} instructions...", line_count);
        }

        // Limit capture so it doesn't run forever on complex sites
        if line_count > 20000 { break; }
    }

    println!("✅ Detonation Complete. {} lines of bytecode saved to {}", line_count, log_path);
    let _ = child.kill().await;

    Ok(())
}
