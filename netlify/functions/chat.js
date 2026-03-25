exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    try {
        const body = JSON.parse(event.body);
        const topic = body.topic;

        if (!topic) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Missing topic' }) };
        }

        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            return { statusCode: 500, body: JSON.stringify({ error: '服务器配置未完成：请在 Netlify 填写 API_KEY' }) };
        }

        const baseURL = process.env.BASE_URL || 'https://api.siliconflow.cn/v1/chat/completions';
        const model = process.env.MODEL || 'Qwen/Qwen2.5-7B-Instruct';

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
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };
        
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message || 'Server Error' })
        };
    }
};
