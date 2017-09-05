/**
 * 应用程序启动文件
 */

//加载express模块
var express = require('express');
//加载模版处理模块
var swig = require('swig');
//加载mongoose数据库模块
var mongoose=require('mongoose');
//加载body-Parser处理模块
var bodyParser=require('body-parser');

//加载cookies模块
var Cookies=require('cookies');

var User=require('./models/User');

//创建app应用
var app=express();

//配置应用模版
//定义当前应用使用的模版引擎
//第一个 模版引擎后缀，第二解析模版文件
app.engine('html',swig.renderFile);
//设置模版文件存放的目录，第一个参数必须是views，第二个是路径
app.set('views','./views')
//注册模版引擎，第一个必须是view angine  第二个必须跟跟设置的模版引擎相同
app.set('view engine','html');
//开发过程关闭每次都重启服务
swig.setDefaults({cache:false});

//静态文件托管
app.use('/public', express.static('public'));

//bodyparse设置
app.use(bodyParser.urlencoded({extended:true}));

//设置cookies
app.use(function(req,res,next){
    req.cookies=new Cookies(req,res);
    //解析登录用户的cookies信息
    req.userInfo={};
    if(req.cookies.get('userInfo')){
        try{
            req.userInfo=JSON.parse(req.cookies.get('userInfo'))
            //获取当前登录用户的类型，是否是管理员
            User.findById(req.userInfo._id).then(function(userInfo){
                req.userInfo.isAdmin=Boolean(userInfo.isAdmin);
                next();
            });
        }catch(e){
            next();
        }
    }else{
        next();
    }
});


//划分模块
app.use('/admin',require('./routers/admin'));
app.use('/api',require('./routers/api'));
app.use('/',require('./routers/main'));

app.get('/',function(req,res,next){
    //res.send('<h1>欢迎关注我的博客</h1>')
    res.render('index');
});

//监听http请求
mongoose.connect('mongodb://localhost:27019/mydb',function(err){
    if(err){
        console.log("数据库连接失败");
    }else {
        console.log("数据库连接成功");
        app.listen(8081);
    }
});

