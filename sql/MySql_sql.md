// ***数据库和表******

// show databases; create database if not exists Name;  drop database if exists Name; 
// use Name; select database(); show tables; show create table Name; desc Name;
// 添加字段-        ALTER TABLE 表名 ADD 字段名 类型 (长度) [ COMMENT 注释 ] [ 约束 ];                                   ADD
// 修改数据类型-    ALTER TABLE 表名 MODIFY 字段名 新数据类型 (长度);                                                       MODIFY
// 修改字段名和字段类型-   ALTER TABLE 表名 CHANGE 旧字段名 新字段名 类型 (长度) [ COMMENT 注释 ] [ 约束 ];                CHANGE
// 删除字段-    ALTER TABLE 表名 DROP 字段名;   --修改表名- ALTER TABLE 表名 RENAME TO 新表名;                            RENAME
// 修改表名    ALTER TABLE 表名 RENAME TO 新表名;

// --增        **** insert into .......value  *******
// INSERT INTO emp(id, workno, name, gender, age, idcard, entrydate, username) 
// VALUES (3,1,'ARXH', '男', 50, '452702200001158250', '2023-7-10', '一晴之雨');
// INSERT INTO emp
// VALUES (3,1,'ARXH', '男', 50, '452702200001158250', '2023-7-10', '一晴之雨'),
// (3,1,'ARXH', '男', 50, '452702200001158250', '2023-7-10', '一晴之雨');
// --改            ******* update *****
// update employee set name = 'YQZY' where id = 3;
// UPDATE employee set name = "小鱼" , gender = '女' , age= '18' where id = 3;
// update employee set entrydate = '1949-10-1';
// --删                ****** delete from  *****
// delete from employee WHERE id = 1;                                                     
// DELETE from emp;

// DQL
// 普通查询    SELECT 字段1 [ AS 别名1 ] , 字段2 [ AS 别名2 ] ... FROM 表名;
// 条件查询    SELECT 字段列表 FROM 表名 WHERE 条件列表 ;                                      is not NUL  between...and...    in(15 , 20, 30)       LIKE '%X'  或者  LIKE '___________X'
// 聚合查询    SELECT 聚合函数(字段列表) FROM 表名 ;                                                           count()  max() min()  sum()
// 分组查询    SELECT 字段列表 FROM 表名 [ WHERE 条件 ] GROUP BY 分组字段名 [ HAVING 分组后过滤条件 ];                GROUP BY....HAVING
// 排序查询    SELECT 字段列表 FROM 表名 ORDER BY 字段1 排序方式1 , 字段2 排序方式2 ;              ASC 升序  desc 降序
// 分页查询    SELECT 字段列表 FROM 表名 LIMIT 起始索引, 查询记录数 ;                              LIMIT

// DCL
// CREATE USER '用户名'@'主机名' IDENTIFIED BY '密码';                                         IDENTIFIED BY
// ALTER USER '用户名'@'主机名' IDENTIFIED WITH mysql_native_password BY '新密码' ;
// drop user '用户名'@'主机名';

// 查询权限     SHOW GRANTS FOR '用户名'@'主机名' ;                                GRANTS FOR
// 授予权限     GRANT 权限列表 ON 数据库名.表名 TO '用户名'@'主机名';              GRANT....ON...TO
// 撤销权限     REVOKE 权限列表 ON 数据库名.表名 FROM '用户名'@'主机名';

//--****约束****  NOT NULL    UNIQUE      PRIMARY KEY     DEFAULT '1'     CHECK(name>0)
// --添加外键    ALTER TABLE 表名 ADD CONSTRAINT 外键名称 FOREIGN KEY (外键字段名) REFERENCES 主表 (主表列名) ;
// alter table wholesale add constraint fk_wholesale_shelf_id foreign key (shelf_id) references shelf(id) on update cascade on delete cascade ;
// --删除外键    ALTER TABLE 表名 DROP FOREIGN KEY 外键名称;
// alter table wholesale drop foreign key fk_wholesale_shelf_id;
// --**删除更新约束***    RESTRICT 有则不删除/更新     CASCADE 有，则也删除/更新子表记录   set NULL  *** set defuse ''
// on update set null on delete set null;

//---------**多表查询******  outer 可以省略
// SELECT 字段列表 FROM 表1 , 表2 WHERE 条件 ... ;                           //隐式内连接  
// SELECT 字段列表 FROM 表1 [ INNER ] JOIN 表2 ON 连接条件 ... ;             //显示内连接  (左表) inner join (右表) on
// SELECT 字段列表 FROM 表1 LEFT [ OUTER ] JOIN 表2 ON 条件 ... ;            //左连接      (左表) left outer join (右表) on     
// SELECT 字段列表 FROM 表1 RIGHT [ OUTER ] JOIN 表2 ON 条件 ... ;           //右连接      (左表) right outer join (右表) on
// SELECT 字段列表 FROM 表A 别名A JOIN 表A 别名B ON 条件 ... ;               //自连接      (表别名a) join (表别名b) on    

//---------**联合查询******     union all  去重删除all          对于联合查询的多张表的列数必须保持一致，字段类型也需要保持一致
// SELECT 字段列表 FROM 表A ...
// UNION [ ALL ]
// SELECT 字段列表 FROM 表B ....;

//---------**子查询******                SELECT * FROM t1 WHERE column1 = ( SELECT column1 FROM t2 );    INSERT / UPDATE / DELETE / SELECT
// A. 标量子查询（子查询结果为单个值）      = <> > >= < <=
// B. 列子查询(子查询结果为一列)            IN 、NOT IN 、( ANY 等同 SOME )、 ALL
// C. 行子查询(子查询结果为一行)            = 、<> 、IN 、NOT IN
// D. 表子查询(子查询结果为多行多列)        IN







