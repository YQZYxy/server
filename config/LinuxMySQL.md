


//更新服务器
sudo apt update 
 //安装默认包：
sudo apt install mysql-server      
//运行安全脚本：
sudo mysql_secure_installation

//请从终端打开 MySQL
sudo mysql
//接下来，使用以下命令检查每个 MySQL 用户帐户使用的身份验证方法：
SELECT user,authentication_string,plugin,host FROM mysql.user;
//切换到mysql数据库
use mysql
//您可以在此示例输出中看到root MySQL 用户现在使用密码进行身份验证。
//在您自己的服务器上确认后更改 "mysql" 数据库里的 "user" 表里的 "host" 项，将"localhost"改称"%"
update user set host = '%' where user = 'root';
//#刷新cache中配置
flush privileges;
//查看更改修改
select host, user from user;
//你也可以自定义root密码 
ALTER USER 'root'@'%' IDENTIFIED WITH MYSQL_NATIVE_PASSWORD BY 'root';
//如果出于某种原因，它没有自动启动，请使用以下命令启动并使其在系统启动时启动
systemctl enable mysql

//查看服务状态
sudo service mysql status
//停止服务
sudo service mysql stop
//启动服务
sudo service mysql start
//重启服务
sudo service mysql restart

//设置免密登录
sudo vim /etc/mysql/my.cnf //在后面加下面语句
// [mysqld]
// skip-grant-tables

grant system_user on *.* to 'root';  //设置root授予权限
//系统分配的密码
sudo vim /etc/mysql/debian.cnf  
//设置密码
update user set authentication_string='' where user='root';  //先置空
flush privileges;
ALTER USER 'root'@'%' IDENTIFIED WITH MYSQL_NATIVE_PASSWORD BY 'new password';// 
或者
update mysql.user set authentication_string= "password('new password')" where user='root' and Host ='localhost';
update user set plugin="mysql_native_password"; 
flush privileges;
quit;

// 修改MySql远程连接配置
sudo vim /etc/mysql/mysql.conf.d/mysqld.cnf  // 添加 bind-address = 0.0.0.0
//添加端口
sudo ufw allow 80/tcp
sudo ufw allow 3306/tcp

iptables -vnL | grep 3306
//添加需要监听的端口
sudo /sbin/iptables -I INPUT -p tcp --dport 3306 -j ACCEPT        //远程必给这个

///////////////////////////////////简化版/////////////////////////////////////
/安装MySQL
$ sudo apt-get update #更新源
$ sudo apt-get install mysql-server #安装mysql
$ sudo mysql_secure_installation #按提示设置即可
$ sudo vim /etc/mysql/mysql.conf.d/mysqld.cnf #找到 bind-address 修改值为 0.0.0.0(如果需要远程访问)
$ sudo /etc/init.d/mysql restart #重启mysql

//二、设置root账号为远程访问
ALTER USER 'root'@'localhost' IDENTIFIED BY 'password' PASSWORD EXPIRE NEVER; #修改加密规则
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '新密码'; #使用mysql_native_password重新修改密码
UPDATE mysql.user SET host = '%' WHERE user = 'root'; #允许远程访问
FLUSH PRIVILEGES;

//三、新增用户赋权并设置远程访问
CREATE USER 'sammy'@'%' IDENTIFIED WITH mysql_native_password BY 'password';
GRANT ALL PRIVILEGES ON *.* TO 'yqzy'@'%' WITH GRANT OPTION;