mysqldump -h rm-bp19uqkfin5901ah6o.mysql.rds.aliyuncs.com -u root -pSonic513 -P3306 thc_platform  --set-gtid-purged=OFF | mysql -uhomestead -psecret homestead