var site = function() {
    var page = {};

    return {
        page: page
    };
}();


site.page.createViewModel = function(init) {	

	site.page.viewModel = function(init) {
		if (init === undefined) init = {};		
		
		var login = function() {
			var groupName  = "LoginGroup";
			
			var userName = ko.observable(init.userName).extend({ mandatory: groupName });
			var password = ko.observable(init.password).extend({ mandatory: groupName, password: groupName });
			var message = ko.observable("");
			
			var submit = function() {
				$.validation.setShowGroupMessages(groupName, true);
				message("");
				
				if (!$.validation.validateGroup(groupName)) {
					message("Cannot continue, please fix validation issue.");
					return;
				}
					
				message("Log in with existing user.");
			};

		    return {
		        userName: userName,
		        password: password,
		        message: message,
		        submit: submit
		    };
		}();
		
		var register = function(){
			var groupName  = "RegisterGroup";
			
			var name = ko.observable(init.name).extend({ mandatory: groupName });
			var email = ko.observable(init.email).extend({ mandatory: groupName });
			var phone = ko.observable(init.phone).extend({ phone: groupName });
			var message = ko.observable("");
			
			
			var submit = function() {
			$.validation.setShowGroupMessages(groupName, true);
				message("");
				
				if (!$.validation.validateGroup(groupName)) {
					message("Cannot continue, please fix validation issue.");
					return;
				}
					
				message("Register new user.");
			};

		    return {
		        name: name,
		        email: email,
		        phone: phone,
		        message: message,
		        submit: submit
		    };
		}();		
		
		return {
			login: login,
			register: register
		};		
	}(init);	
};