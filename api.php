<?php
if (PHP_VERSION < '5.0.0'){
	header("Content-type: text/html;charset=utf-8"); 
	exit('您的PHP版本过低本系统建议使用5.0.0以上版本'); 
}
error_reporting( 2 );

$msg = htmlspecialchars( $_GET['msg'] );
$pictureid = htmlspecialchars( $_GET['pictureid'] );

$JSON = array(
	'code' => 1,
	'msg' => '发送成功！',
	'comment' => array(
			array(
				'avatar' => 'http://0.gravatar.com/avatar/cbbe656c7bb46772f589c9b18a7c747e?s=35&d=&r=G',
				'user' => 'M.J',
				'msg' => $msg
			)
		)
);

$result = json_encode( $JSON );
echo $result;
?>