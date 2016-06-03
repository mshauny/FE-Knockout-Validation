
$.validation = function() {
		var registeredFields = ko.observableArray([]);
		var registeredGroups = ko.observableArray([]);				
		var hasPageError = ko.observable(false);				
		var showPageMessages = ko.observable(false);
		
		var hasErrorInArray = function(observables) {			
			for (var k = observables.length - 1; k >= 0; k--) {
				if (observables[k].hasError()) return true;
			}			
			return false;
		};
		
		var getValidationGroupByName = function(groupName) {			
			for (var k = registeredGroups().length - 1; k >= 0; k--) {
				if (registeredGroups()[k].name === groupName) return registeredGroups()[k];
			}
			
			return undefined;			
		};
		
		var registerValidationField = function(model) {
			if (model.validationGroup === undefined || model.validationGroup === null) {
				registeredFields().push(model);
				return;
			}
			
			var group = getValidationGroupByName(model.validationGroup);
			if (group !== undefined) {
				group.registeredFields().push(model);
				return;
			}
			
			var newValidationGroup = {
				name: model.validationGroup,
				showMessages: ko.observable(false),
				registeredFields: ko.observableArray([model])
			};			
			
			registeredGroups().push(newValidationGroup);
		};
		
		var validatePage = function() {	
			var isValid = true;
			if (hasErrorInArray(registeredFields())) isValid = false;
				
			return hasPageError(!isValid);
		};
		
		var registerValidation = function(model) {
			if (model.validationGroup === undefined || model.validationGroup === null) {
				model.subscribe(validatePage);				
				validatePage();
				return;
			}	
		};		
		
		var validateGroup = function(groupName) {			
			var group = getValidationGroupByName(groupName);
			if (group !== undefined) {
				return !hasErrorInArray(group.registeredFields());
			}		
			
			return undefined;				
		};
	
		var initObservable = function(model, groupName) {
			if (model.errors !== undefined && model.errors !== null) return model;
			model.validationGroup = groupName;
			

			model.errors = ko.observableArray([]);
			model.hasError = ko.computed(function () {
				return model.errors().length > 0;
			});
			
			model.showMessages = ko.observable(false);
			var updateMessageVisibility = function() {
				var group = getValidationGroupByName(groupName);				
				if (group !== undefined) {
					return model.showMessages(group.showMessages());
				}
				
				return model.showMessages(showPageMessages());
			};			
			
			model.message = ko.computed(function () {
				if (!model.showMessages()) return;
				
				var msg = "";			
				for (var k = model.errors().length - 1; k >= 0; k--) {
					msg = msg + model.errors()[k] + ((k <= 0) ? "" : "; ");
				}
				return msg;
			});

			model.clearErrors = function () {
				model.errors.removeAll();
			};		
			
			registerValidationField(model);
			model.subscribe(updateMessageVisibility);	
			
			var group = getValidationGroupByName(groupName);				
			if (group !== undefined) {
				group.showMessages.subscribe(updateMessageVisibility);
			} else {
				showPageMessages.subscribe(updateMessageVisibility);
			}
			
			return model;		
		};

        var setShowGroupMessages = function(groupName, enabled) {
            var group = getValidationGroupByName(groupName);
            if (group !== undefined) {
                group.showMessages(enabled);
                return;
            }
        };

    return {
        validatePage: validatePage,
        validateGroup: validateGroup,
        registerValidation: registerValidation,
        initObservable: initObservable,
        hasPageError: hasPageError,
        showPageMessages: showPageMessages,
        setShowGroupMessages: setShowGroupMessages,
        registeredGroups: registeredGroups
    };
}();


/* Create the type specific validators */

ko.extenders.mandatory = function (target, validationGroup) {
    $.validation.initObservable(target, validationGroup);
    var errMsgRequired = "This field is required";

    function resetPrevious() {
        target.errors.remove(errMsgRequired);
    }

    function validate(newValue) {
        resetPrevious();

        if (newValue === undefined || newValue === null || newValue === "") {
            target.errors.push(errMsgRequired);
        }
    }

    validate(target());
    target.subscribe(validate);
	$.validation.registerValidation(target);

    return target;
};

ko.extenders.email = function (target, validationGroup) {
    $.validation.initObservable(target, validationGroup);
    var errMsgEmail = "Invalid email structure used.";
  
    function resetPrevious() {
        target.errors.remove(errMsgEmail);
    }

    function validate(newValue) {
        resetPrevious();
		
		if (newValue === undefined || newValue === null || newValue === "") {
            return true;
        }
		
		var regEx = /\S+@\S+\.\S+/;
		
        if (!regEx.test(newValue)) {
            target.errors.push(errMsgEmail);
        }
    }

    validate(target());
    target.subscribe(validate);
	$.validation.registerValidation(target);

    return target;
};

ko.extenders.amount = function (target, validationGroup) {
    $.validation.initObservable(target, validationGroup);
    var errMsgDecimal = "Please type in valid amount value e.g. ### ###.##";
    target.value = ko.computed(function() {
		var value = target().replace(/ /g, "");
		return value;			
	});

    function resetPrevious() {
        target.errors.remove(errMsgDecimal);
    }

    function validate(newValue) {
		resetPrevious();
		var cleaned = newValue.replace(/ /g, "");	
		
		if (cleaned === undefined || cleaned === null || cleaned === "") {
            return true;
        }
        
		var regEx = /^(\d+\.?\d{0,2}|\.\d{1,2})$/ ;
		
		if (!regEx.test(cleaned)) {
            target.errors.push(errMsgDecimal);
        }
    }

    validate(target());
    target.subscribe(validate);
	$.validation.registerValidation(target);

    return target;
};

ko.extenders.number = function (target, validationGroup) {
    $.validation.initObservable(target, validationGroup);
    var errMsgNumber= "Please type in a valid number.";

    function resetPrevious() {
        target.errors.remove(errMsgNumber);
    }

    function validate(newValue) {
		resetPrevious();
		
		if (newValue === undefined || newValue === null || newValue === "") {
            return true;
        }
        
		var regEx = /^\d+$/;
		
        if (!regEx.test(newValue)) {
            target.errors.push(errMsgNumber);
        }
    }

    validate(target());
    target.subscribe(validate);
	$.validation.registerValidation(target);

    return target;
};

ko.extenders.password = function (target, validationGroup) {
    $.validation.initObservable(target, validationGroup);
    var errMsgLength = "Minimum 5 characters";
	var errMsgAplhaNumeric = "Must have numbers and characters";
  

    function resetPrevious() {
        target.errors.remove(errMsgLength);
		target.errors.remove(errMsgAplhaNumeric);
    }

    function validate(newValue) {
        resetPrevious();
		var foundError = false;
		
		if (newValue === undefined || newValue === null || newValue === "") {
			return true;
		}
		
		
		if (newValue.length < 5) {
			target.errors.push(errMsgLength);
			foundError = true;
		}

        if (!newValue.match(/\d+/g) || !newValue.match(/^[0-9a-zA-Z]+$/)) {
            target.errors.push(errMsgAplhaNumeric);
			foundError = true;
        }

		return foundError;
    }

    validate(target());
    target.subscribe(validate);
	$.validation.registerValidation(target);


    return target;
};

ko.extenders.phone = function (target, validationGroup) {
    $.validation.initObservable(target, validationGroup);
    var errMsgFormat = "Phone number is an incorrect format (+27 99 999 9999)";
    var errMsgCountry = "Must be a phone number in South Africa";
    target.isInternationalNumber = ko.observable(false);
	target.value = ko.computed(function() {
		var number = target().replace(/ /g, "");

		if (number.indexOf("0") === 0) {
			number = "+27" + number.substring(1, number.length);
		}

		return number;			
	});

    function resetPrevious() {
        target.errors.remove(errMsgFormat);
        target.errors.remove(errMsgCountry);
    }

    function validate(newValue) {
        resetPrevious();
        target.isInternationalNumber(false);

        if (newValue === undefined || newValue === null || newValue === "") {
            return true;
        }

        var cleanedValue = newValue.replace(/ /g, "");
        var isLocalNumber = cleanedValue.length === 10 && cleanedValue.match(/^[0][0-9]+$/);
        if (isLocalNumber) {
            return true;
        }

        var isIntNumber = cleanedValue.length === 12 && (cleanedValue.match(/^[+][0-9]+$/));
            
            
        if (isIntNumber) {
            target.isInternationalNumber(true);

            if (cleanedValue.indexOf("+27") !== 0) {

                target.errors.push(errMsgCountry);
                return false;
            }

            return true;
        }

        target.errors.push(errMsgFormat);
        return false;
    }

    validate(target());
    target.subscribe(validate);
	$.validation.registerValidation(target);

    return target;
};

/* Card validation requires jquery.creditCardValidator.js */
ko.extenders.pan = function (target, validationGroup) {
	$.validation.initObservable(target, validationGroup);
    var defaultCardType = "Unknown";
    var errMsgCardFormat = "Card number is not in correct format";
    var errMsgIncorrectCard = "Incorrect card used";

    target.validLuhn = ko.observable(false);
    target.cardType = ko.observable(defaultCardType);
	target.value = ko.computed(function() {
		return target().replace(/-/g, "");
	});

    function resetPrevious() {
        target.errors.remove(errMsgCardFormat);
        target.errors.remove(errMsgIncorrectCard);
    }

    //define a function to do validation
    function validate(newValue) {
        var hasValue = true;
        var isValid = false;

        resetPrevious();

        if (newValue === undefined || newValue === null || newValue === "") {
            hasValue = false;

        } else {
            var elem = $(document.createElement("input")).attr("value", newValue);
            var panResult = $(elem).validateCreditCard({ accept: ["visa", "mastercard"] });

            target.validLuhn(panResult.luhn_valid);
            var cardType = (panResult.card_type !== undefined && panResult.card_type !== null)
                ? panResult.card_type.name
                : defaultCardType;

            target.cardType(cardType);
            isValid = panResult.valid;
        }

        if (hasValue && !target.validLuhn()) {
            target.errors.push(errMsgCardFormat);
        }
        else if (hasValue && !isValid) {
            target.errors.push(errMsgIncorrectCard);
        }
    }

    validate(target());
    target.subscribe(validate);
	$.validation.registerValidation(target);

    return target;
};



