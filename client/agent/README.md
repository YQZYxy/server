# 目录
cd client/agent

# 安装依赖
pip install -r requirements.txt

# 启动（默认 127.0.0.1:9527）
python main.py

# 指定参数
python main.py --host 0.0.0.0 --port 9527

# 使用外部 API
python main.py --api-url https://api.deepseek.com/v1/chat/completions --api-key sk-xxx