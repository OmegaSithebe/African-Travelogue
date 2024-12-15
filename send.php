<?php
	/*Attaining information from form*/
	if(isset($_POST['submit'])){
		$name = $_POST['name'];
		$email = $_POST['email'];
		$msg = $_POST['message'];
		
		/*Where the message goes,subject line,message and sender*/
		$to = 'info@africantravelogue.co.za';
		/*$to = 'tavinvision@gmail.com';*/
		$subject = 'Contact From Website';
		$message = "Name: ".$name."\n\n".
				   "Message: "."\n\n".$msg;
		$headers = "From: ".$email;
		
		/*Notification*/
		if(mail($to, $subject, $message, $headers)){
			echo "<h1>Thanks for your message "." ".$name.", we'll get back to you soon.</h1>";
		}else{			
			echo "We did not receive your message, please send us an email";
		}	
	}
	
?>
<script type="text/javascript">
function delayedRedirect()
{
	window.location = "https://africantravelogue.co.za/contact.html"
}
</script>
</head>

<body onLoad="setTimeout('delayedRedirect()', 4000)">

</body>