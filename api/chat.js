module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { topic } = req.body;
    if (!topic) {
        return res.status(400).json({ error: 'Missing topic' });
    }

    // 从您在云端 (Vercel) 配置的环境变量中安全读取 API 密钥
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: '服务器配置未完成：请在 Vercel 填写 API_KEY 环境变量' });
    }

    // 高阶配置：为了让您可以随心所欲切换完全免费的第三方中转（比如硅基流动），支持自定义 URL 和模型名称。
    // 如果您在 Vercel 不填这两个，就会默认调用硅基流动官方接口。
    const baseURL = process.env.BASE_URL || 'https://api.siliconflow.cn/v1/chat/completions';
    const model = process.env.MODEL || 'Qwen/Qwen2.5-7B-Instruct';

    try {
        const response = await fetch(baseURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                max_tokens: 800,
                messages: [
                    { role: 'system', content: '你是习惯养成助手。严格返回25个与该主题高度相关、简短（12字以内）的可行性微任务。严禁带有分析或解释过程，绝对不能有多余的换行符和文本，仅纯粹输出一组合法的JSON格式字符串数组！示例：["早睡早起", "多喝热水"]' },
                    { role: 'user', content: `请彻底放飞想象，针对主题 "${topic}" 生成25个精彩的Bingo微任务。` }
                ]
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`API 请求失败: ${response.status} - ${errBody}`);
        }

        const data = await response.json();
        return res.status(200).json(data);
        
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
