/**
 * New node file
 */
$(document).ready(function() {
	
//	$("body").delegate("#sendEmailForm", "submit", function(ev) {
//		$.ajax({
//			type : $(this).attr('method'),
//			url : $(this).attr('action'),
//			data : $(this).serialize(),
//			success : function(data) {
//				showRecievedMessage(JSON.parse(data));
//			},
//			error : function(data) {
//				showRecievedMessage(data);
//
//			}
//
//		});
//
//		ev.preventDefault();
//	});
	
});


function showRecievedMessage(data) {
	if (data.errorCode == 101 || data.errorCode == 401) {
		$("#error-span").text(data.message);
		$("#errorMessage").fadeIn("slow", function() {
			// Animation complete
			setTimeout(function() {
				$("#errorMessage").fadeOut("slow");
			}, 4000);
		});

	} else {
		$("#success-span").text(data.message);
		$("#successMessage").fadeIn("slow", function() {
			// Animation complete
			setTimeout(function() {
				$("#successMessage").fadeOut("slow");
			}, 4000);
		});

	}

}