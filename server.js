const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault('Asia/Seoul');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const { sequelize } = require('./models/index');
const models = require('./models');

sequelize
    .sync()
    .then(() => console.log('connected database'))
    .catch(err => console.error('occurred error in database connecting', err))
// 시퀄라이즈: sql을 쉽게 사용할 수 있게 해주는 ORM 세팅(연결)
// ORM이란: 객체와 데이터베이스 사이의 연결 자동화 -> 클래스와 테이블 사이의 불일치 해소

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

http.listen(8080, () => {
    console.log('success');
})
//http와 express를 이용하여 8080포트로 서버를 개방

app.get('', function (req, res) {
    res.sendFile(__dirname + '/upload.html');
});
// 주소 + 포트만으로 접속했을 때 upload.html 화면을 보여줌

app.get('/upload.css', function (req, res) {
    res.sendFile(__dirname + '/upload.css');
});
// upload.css 파일을 요청이 들어왔을 때 보내줌

app.post('/send_data', async (req, res) => {
    const response = req.body;  //data가 body에 포함되어있음

    if (response['filename'].slice(-4) != '.txt') { //간단한 검증
        res.json({ result: 'fail' });
        return;
    }

    const result_sql = await models.info.findAll({ // info 테이블의 idx 최대값을 가져옴
        attributes: [[sequelize.fn('max', sequelize.col('idx')), 'max_idx']],
        raw: true,
    });
    // console.log(result_sql)
    let cur_idx = 0;
    if (result_sql[0]['max_idx'] != null) {
        cur_idx = result_sql[0]['max_idx'] + 1;
    }   // 저장할 파일을 idx최댓값에서 +1 해서 저장

    let temp = {};
    temp['idx'] = cur_idx
    temp['file'] = response['filename'];
    temp['time'] = moment().format('YYYY-MM-DD HH:mm:ss');
    await models.info.create(temp);
    // idx 최댓값 + 1에 저장할 때 알아보기 쉽게 idx번호랑 이름, 저장 시간 넣음

    temp = {};
    for (const ii of response['data']) {
        for (const jj of ii) {
            let temp = jj;
            temp['idx'] = cur_idx;
            await models.data.create(temp);
        }
    }   // data 테이블에 반복문으로 data 저장

    const file_list = await get_file_list();
    io.emit('리스트드렸습니당', file_list);
    res.json({ result: 'ok' });
});

io.on('connection', (socket) => {
    socket.on('업뎃해주세용', async (msg) => {
        const file_list = await get_file_list();
        io.to(socket.id).emit('리스트드렸습니당', file_list);   // to 부분 귓말
    });
}); // '업뎃해주세용' 받았을 때 리스트 드렸습니다 메세지 보냄

async function get_file_list() {
    const file_list = await models.info.findAll({
        raw: true,
    }); // info 테이블 모든 내용을 가져온다
    return file_list;
}

app.get('/chart/:argument', async function (req, res) {
    console.log(req.params)
    const param_idx = parseInt(req.params.argument);
    if (!Number.isInteger(param_idx)) {
        res.redirect('/');
        return;
    }
    const info_raw = await models.info.findAll({
        where: { 'idx': param_idx },
        raw: true,
    });
    if (Object.keys(info_raw).length == 0) {
        res.redirect('/');
        return;
    }
    res.sendFile(__dirname + '/chart.html');
}); // 링크로 받은 숫자가 info테이블 idx에 있다면 chart.html보내줌 아니면 메인화면

app.post('/get_data', async (req, res) => {
    const get_idx = req.body.idx;
    let return_json = {};
    
    const data_raws = await models.data.findAll({
        where: { 'idx': get_idx },
        raw: true,
    });
    return_json['datas'] = data_raws;
    return_json['result'] = 'ok';
    res.json(return_json);
}); // get_data 메세지 받으면 body의 idx를 가져옴 -> data 테이블에 있는 idx와 일치하는 데이터를 다 가져와서 datas에 저장 후 뱉음