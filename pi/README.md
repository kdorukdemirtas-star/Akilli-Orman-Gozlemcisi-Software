# Pi asistan

Raspberry Pi 5 (4 GB). USB LoRa alıcı burada değil; Mac/PC `rx_to_supabase.py` kalır.

## Model

Qwen 3.5 0.8B, Q4 GGUF. llama.cpp. Bağlam 2048–4096. 262K açma.

Örnek:

```bash
./llama-server -m Qwen3.5-0.8B-Q4_K_M.gguf --port 8080 -c 4096 --system-prompt-file AOG.md
```

PWA eklentisine `http://<pi>:8080` yazılır.

## ML

Paket tablosu (`t`, `mq9`, `a8`, `a9`, saat, rssi) ayrı süreç. Asistan ile aynı anda eğitme.
