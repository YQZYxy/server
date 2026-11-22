////////////////////////////////常用命令/////////////////////////////////////////////////////
which svnserve  //查命令绝对路径

//温度
sudo sensors

// 删除软件包
sudo apt-get purge [package]         //删除已安装包（不保留配置文件)，删除软件包，同时删除相应依赖软件包`。
sudo apt-get autoremove [package]    // 删除已安装的软件包（保留配置文件），不会删除依赖软件包，且保留配置文件。（这个命令容易导致系统无法进入系统桌面）高能警告：慎用本命令！！！它会在你不知情的情况下，一股脑删除很多“它认为”你不再使用的软件；
sudo apt-get remove [package]           //删除已安装的软件包（保留配置文件），不会删除依赖软件包，保留配置文件`；
sudo apt clean                       //相当于清理下载的软件安装包。

////////////////////////////////磁盘//////////////////////////////////////////////////
sudo lsblk   //树结构
sudo fdisk /dev/sdb   //选择磁盘
sudo mount /dev/sdb1 /Hdata  //挂载磁盘

//配置挂载
sudo blkid                    //首先查看UUID
sudo vim /etc/fstab      //开机挂载
UUID=xxx            	/sdb1	 ext4	        defaults	   0	      0
要挂载的分区设备号	    挂载点  文件系统类型	    挂载选项	是否备份	是否检测

修复挂载错误的相应的分区,如提示中的/dev/sdb1，输入：sudo ntfsfix /dev/sdb1

// 查看文件夹大小
sudo df -h
sudo du -hd 1 path(当前目录下指定的文件夹名)/

sudo vgdisplay ubuntu-vg | grep "Free"			//空闲空间
sudo lvextend -l +100%FREE /dev/ubuntu-vg/ubuntu-lv		//扩展逻辑卷 (LV)
df -Th | grep '^/dev/mapper/ubuntu--vg'   ////ext4////    sudo resize2fs /dev/ubuntu-vg/ubuntu-lv  /////xfs//////    sudo xfs_growfs /

//////////////////////////////网络//////////////////////////////////////////////

//静态ip
cd /etc/netplan
sudo netplan apply

// 源suod
sudo apt-get update
sudo apt-get grade

deb http://mirrors.aliyun.com/ubuntu/ bionic main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ bionic-security main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ bionic-updates main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ bionic-proposed main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ bionic-backports main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-security main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-updates main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-proposed main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-backports main restricted universe multiverse

///////////////////////防火墙///////////////////////////////////////////////////////////
// ***Firewalld*****端口连接不上 搞这个 好使
sudo systemctl start firewalld      //启动Firewalld服务：
sudo systemctl stop firewalld       //停止Firewalld服务：
sudo systemctl disable firewalld         //禁止Firewalld开机自启：
sudo firewall-cmd --zone=public --add-port=3723/tcp --permanent   //添加端口且重新加载防火墙
sudo firewall-cmd --zone=public --remove-port=80/tcp --permanent  //移除
sudo firewall-cmd --add-service <服务> --permanent        //添加服务
sudo firewall-cmd --reload          //重新启动Firewalld服务：

sudo firewall-cmd --state                //这个命令会显示防火墙是否正在运行。
sudo firewall-cmd --list-all        //列出所有防火墙规则：
sudo systemctl status firewalld          //查状态
sudo firewall-cmd --get-services    //查看所有活动服务

//这个命令会临时添加一个端口，<port> 是要开放的端口号，<protocol> 是要开放的协议（tcp 或 udp）。如果想要永久性地添加端口，可以加上 --permanent 参数，并且记得执行 firewall-cmd --reload 命令使配置生效。
firewall-cmd --add-port=<port>/<protocol> [--permanent]     
//这个命令会移除一个已开放的端口，参数和使用方式与添加端口相同。
firewall-cmd --remove-port=<port>/<protocol> [--permanent]

//这个命令会开放一个预定义的服务，如 http、ssh 等。如果想要永久性地添加服务，可以加上 --permanent 参数，并且记得执行 firewall-cmd --reload 命令使配置生效。
firewall-cmd --add-service=<service> [--permanent]
//这个命令会移除一个已开放的服务，参数和使用方式与添加服务相同。
firewall-cmd --remove-service=<service> [--permanent]

# 允许指定的子网访问服务或端口：
sudo firewall-cmd --add-rich-rule 'rule family="ipv4" service name="ssh" \
source address="192.168.0.12/32" accept' --permanent

#启用端口转发：
sudo firewall-cmd --add-masquerade --permanent

# Port forward to a different port within same server ( 22 > 2022)                                  //端口转发到同一服务器内的不同端口
sudo firewall-cmd --add-forward-port=port=22:proto=tcp:toport=2022 --permanent

# Port forward to same port on a different server (local:22 > 192.168.2.10:22)                      //端口转发到不同服务器上的相同端口
sudo firewall-cmd --add-forward-port=port=22:proto=tcp:toaddr=192.168.2.10 --permanent

# Port forward to different port on a different server (local:7071 > 10.50.142.37:9071)             //端口转发到不同服务器上的不同端口
sudo firewall-cmd --add-forward-port=port=7071:proto=tcp:toport=9071:toaddr=10.50.142.37 --permanent

// 自带下面的没啥用  狗都不用
sudo ss -ltn      //简洁显示防火墙
lsof -i         //查看端口
sudo ufw status          //防火墙状态
sudo ufw allow 3723/tcp      //防火墙打开端口，添加tcp
sudo ufw delete allow 3723           //关闭端口
sudo ufw enable           //启动防火墙
sudo ufw disable          //关闭防火墙
sudo ufw reload           //重启防火墙
sudo ufw allow from 192.168.3.1  //开放指定ip所有操作
sudo ufw delete allow from 192.168.3.1  //关闭
sudo ufw allow from 192.168.3.1 to any port 3306  //开放指定ip对应端口操作
sudo ufw delete allow from 192.168.3.1 to any port 3306//关闭
sudo ufw default allow       //运行所有外来访问
sudo ufw default deny        //拒接所有外来访问，本机能正常访问外部


///////////////////////////开机自启/////////////////////////////////////////////////////////////////////////////////
开机自启服务，但是在 ubuntu 20.04 上，该服务默认没有开启。
sudo vim /lib/systemd/system/rc-local.service
[Install]
WantedBy=multi-user.target
Alias=rc-local.service

//需要自己创建 vi /etc/rc.local
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


//////////////////////////////Samba/////////////////////////////////////////////////////////////////
sudo apt-get install samba samba-common  //安装
sudo smbpasswd -a <用户名>  //设置登录用户

sudo vim /etc/samba/smb.conf    //配置文件
[<共享名>]
path = /Hdata       //目录或者文件地址
available = yes
valid users = yqzy  //用户名
read only = no
browsable = yes
public = yes
writable = yes

sudo service smbd restart  //重启

//////////////////////////////cpu 设置/////////////////////////////////////////////////////////////////
sudo apt-get install cpufrequtils
cpufreq-info
cpufreq-set -g performance --min 1200MHz --max 2000MHz

使用上述方式，重启系统后又回到默认方式。修改默认模式：
1，安装sysfsutils
sudo apt-get install sysfsutils
2，编辑sudo vim /etc/sysfs.conf ，增加如下语句：
devices/system/cpu/cpu0/cpufreq/scaling_governor = performance
powersave           //是无论如何都只会保持最低频率的所谓“省电”模式；
userspace           //是自定义频率时的模式，这个是当你设定特定频率时自动转变的；
ondemand            //一有cpu计算量的任务，就会立即达到最大频率运行，等执行完毕就立即回到最低频率；
conservative        //翻译成保守的，也就是默认的模式，一般选择这个，会自动在频率上下限调整；
performance         //顾名思义只注重效率，无论如何一直保持以最大频率运行。



