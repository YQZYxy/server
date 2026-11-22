
//window UE5 兼容svn
"D:\Epic Games\UE5.3.2\UnrealEngine-5.3.2-release\Engine\Binaries\ThirdParty\svn\Win64\svnadmin.exe"  create --compatible-version 1.9  D:\SVN\yqzy

//window svnserver启动
 sc.exe create YQZYSvn binPath= "D:\Epic Games\UE5.3.2\UnrealEngine-5.3.2-release\Engine\Binaries\ThirdParty\svn\Win64\svnadmin.exe --service -r D:\SVN\yqzy" start= auto depend= Tcpip
 sc.exe create YQZYSvn binPath= "C:\Program Files\TortoiseSVN\bin\svnadmin.exe --service -r D:\SVN\yqzy" start= auto depend= Tcpip
启动：  sc.exe start YQZYSvn
关闭：  sc.exe stop YQZYSvn
删除：  sc.exe delete YQZYSvn

//////////////////////////////////  SVN //////////////////////////////////////////////////////
//简单的修改几处配置：（去掉前面的#，并且顶格，不然可能会报错）
//创建一个目录做为svn的根目录，比如/data/svnadmin
sudo mkdir /data/svnadmin
sudo svnadmin create /data/svnadmin/ProjectXX

//sudo vim svnserve.conf 将下面几行的注释 # 去
#anon-access = none             （设置为 none 才可以用小乌龟看 svn 日志）
#auth-access = write            （权限用户可写）
#password-db = password         （密码文件为 password）
#authz-db = authz

sudo chmod 777 文件名  //权限

//配置用户权限，打开 /home/svn/repository/conf/authz 文件
vim /home/svn/repository/conf/authz
//在 [groups] 下添加组的成员的信息
admin = user1,user2            （将 user1,user2 添加到 admin 组）
[/]                           （针对版本库所有实例）
@admin = rw                    （admin 组用户的权限为可读可写）

//配置/Hdata/svn/ProjectXX/conf/passwd文件
//在[users]节下面，加入用户和密码
//用户名 = 密码
yqzy = yqzy123

//启动svn
sudo svnserve -d -r /data/svnadmin    
//关闭所有svn服务
sudo killall svnserve

//检出代码
svn checkout svn://ip/ProjectXX


//更新提交项目： -m “comment”为该版本代码添加注释。
svn ci -m “comment”

//重新定位命令：
svn switch --relocate 原svn地址 新svn地址

//开机启动SVN
cd /etc/init.d/
sudo vim /etc/init.d/startsvn.sh
========================脚本文件开始==========================
!/bin/sh
## BEGIN INIT INFO
 Provides:          startsvn.sh
 Required-Start:
 Required-Stop:
 Default-Start:     2 3 4 5
 Default-Stop:
 Short-Description: start svn service
## END INIT INFO 
sudo svnserve -d -r /data/yqzy --listen-host localhost
=========================脚本文件结束=========================
sudo chmod 777 startsvn.sh      //权限
sudo update-rc.d startsvn.sh defaults 100   //将脚本添加到自启动项目中

//上面不行或者
# sudo vim /etc/rc.d/rc.loca //加入自动运行 末尾添加脚本的路径

//如果还是没有启动, 运行:  runlevel
//查看当前启动level, 会打印一个数字, 把这个数字加到脚本 startsvn.sh 的 Default-Start 后面, 然后从步骤 3再执行一遍试试.

///////////////////////////开机自启//////////////////////////////////////
开机自启服务，但是在 ubuntu 20.04 上，该服务默认没有开启。
sudo vim /lib/systemd/system/rc-local.service
[Install]
WantedBy=multi-user.target
Alias=rc-local.service

//需要自己创建 sudo vim /etc/rc.local
#!/bin/bash
//命令
exit 0

//权限
sudo chmod 777 /etc/rc.local      

//输入以下命名，使能 rc-local 服务。
sudo systemctl enable rc-local.service 
// 或者
sudo systemctl enable rc-local
// 以上两个命令其实是一个软链接命令