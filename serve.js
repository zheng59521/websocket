const webSocketService = require('ws').Server;
const uuid = require('uuid');
const ws = new webSocketService({ port: 8180 });
let clients = {};
const wsSend = (type, u_uuid, message) => {
    let response = {
        type: type,
        id: clients[u_uuid]['id'],
        nickname: clients[u_uuid]['u_name'],
        message: message
    };
    if (type === 'close') {
        delete clients[u_uuid];
    } else if (type === 'connect') {
        let u_name_obj = [];
        for (let i in clients) {
            u_name_obj.push(clients[i]['u_name']);
        }
        response.nickname = u_name_obj.join(',');
    }
    ws.clients.forEach(val => val.send(JSON.stringify(response)));
}
ws.on('connection', (ws) => {
    const u_uuid = uuid.v4();
    const u_name = u_uuid;
    clients[u_uuid] = { "id": u_uuid, "u_name": u_name, "ws": ws };
    const msg = u_name + '已连接';
    wsSend('connect', u_uuid, msg);
    ws.on('message', (message) => {
        wsSend('message', u_uuid, message);
    });
    // 处理断开链接
    ws.on('close', () => {
        wsSend('close', u_uuid, '用户' + u_name + '离开');
    });
    // //处理错误事件信息  
    ws.on('error', (err) => {
        console.log('throw : err', err);
    });
});