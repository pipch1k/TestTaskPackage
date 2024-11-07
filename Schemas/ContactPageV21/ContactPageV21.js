define("ContactPageV21", ["BaseFiltersGenerateModule", "BusinessRuleModule", "ContactPageV2Resources",
	"ConfigurationConstants", "ContactCareer", "EmailHelper", "TimezoneGenerator",
	"TimezoneMixin", "CommunicationSynchronizerMixin", "CommunicationOptionsMixin"
], function(BaseFiltersGenerateModule, BusinessRuleModule, resources, ConfigurationConstants, ContactCareer,
		EmailHelper) {
	return {
		entitySchemaName: "Contact",
		messages: {

			/**
			 * @message BirthdateChanged
			 * Notify that BirthDate was changed.
			 */
			"BirthdateChanged": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.SUBSCRIBE
			},

			/**
			 * @message SetInitialisationData
			 * Sets initial values for search in social networks.
			 */
			"SetInitialisationData": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.SUBSCRIBE
			},

			/**
			 * @message ResultSelectedRows
			 * Returs selected rows in reference.
			 */
			"ResultSelectedRows": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.SUBSCRIBE
			},

			/**
			 * @message GetCommunicationsList
			 * Requests communications list.
			 */
			"GetCommunicationsList": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.PUBLISH
			},

			/**
			 * @message SyncCommunication
			 * Synchronizes communications.
			 */
			"SyncCommunication": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.PUBLISH
			},

			/**
			 * @message GetCommunicationsSynchronizedByDetail
			 * Requests communications synchronized by detail.
			 */
			"GetCommunicationsSynchronizedByDetail": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.PUBLISH
			},

			/**
			 * @message CallCustomer
			 * Starts phone call in CTI panel.
			 */
			"CallCustomer": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.PUBLISH
			}
		},
		attributes: {
			"PrimaryContactAdd": {
				dataValueType: Terrasoft.DataValueType.BOOLEAN,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
			},
			"SomeCalcField": {
				name: "CalcField",
				dataValueType: Terrasoft.DataValueType.TEXT,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
			},
			"Owner": {
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				lookupListConfig: {filter: BaseFiltersGenerateModule.OwnerFilter}
			},
			/**
			 * @deprecated
			 */
			"AccountIsEmpty": {
				dataValueType: Terrasoft.DataValueType.BOOLEAN,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
			},
			"JobTitle": {
				dependencies: [
					{
						columns: ["Job"],
						methodName: "jobChanged"
					}
				]
			},
			"canUseSocialFeaturesByBuildType": {
				dataValueType: Terrasoft.DataValueType.BOOLEAN,
				value: false
			},
			/**
			 * Contact account.
			 */
			"Account": {
				lookupListConfig: {
					columns: ["Type"]
				}
			},
			/**
			 * Email detail visibility flag.
			 */
			"IsEmailDetailVisible": {
				dataValueType: Terrasoft.DataValueType.BOOLEAN,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
			},
			/**
			 * Contact communication detail name.
			 */
			"CommunicationDetailName": {
				dataValueType: Terrasoft.DataValueType.TEXT,
				value: "ContactCommunication"
			},
			/**
			 * Actualize age system setting value.
			 */
			"IsAgeActualizationEnabled": {
				dataValueType: Terrasoft.DataValueType.BOOLEAN,
				value: true
			},
			/**
			 * Contact email.
			 */
			"Email": {
				"dependencies": [
					{
						"columns": ["Email"],
						"methodName": "syncEntityWithCommunicationDetail"
					}
				]
			},
			/**
			 * Contact phone.
			 */
			"Phone": {
				"dependencies": [
					{
						"columns": ["Phone"],
						"methodName": "syncEntityWithCommunicationDetail"
					}
				]
			},
			/**
			 * Contact mobile phone.
			 */
			"MobilePhone": {
				"dependencies": [
					{
						"columns": ["MobilePhone"],
						"methodName": "syncEntityWithCommunicationDetail"
					}
				]
			},
			/**
			 * Contact home phone.
			 */
			"HomePhone": {
				"dependencies": [
					{
						"columns": ["HomePhone"],
						"methodName": "syncEntityWithCommunicationDetail"
					}
				]
			},
			/**
			 * Language column value.
			 */
			"Language": {
				lookupListConfig: {
					filter: function() {
						return Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
							"IsUsed", 1);
					}
				}
			},
			/**
			 * Contact skype.
			 */
			"Skype": {
				"dependencies": [
					{
						"columns": ["Skype"],
						"methodName": "syncEntityWithCommunicationDetail"
					}
				]
			},
			"Age": {
				"dependencies": [
					{
						"columns": ["BirthDate"],
						"methodName": "setAge"
					}
				]
			}
		},
		rules: {
			"Region": {
				"FiltrationRegionByCountry": {
					ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
					autocomplete: true,
					autoClean: true,
					baseAttributePatch: "Country",
					comparisonType: Terrasoft.ComparisonType.EQUAL,
					type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
					attribute: "Country"
				}
			},
			"City": {
				"FiltrationCityByCountry": {
					ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
					autocomplete: true,
					autoClean: true,
					baseAttributePatch: "Country",
					comparisonType: Terrasoft.ComparisonType.EQUAL,
					type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
					attribute: "Country"
				},
				"FiltrationCityByRegion": {
					ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
					autocomplete: true,
					autoClean: true,
					baseAttributePatch: "Region",
					comparisonType: Terrasoft.ComparisonType.EQUAL,
					type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
					attribute: "Region"
				}
			}
		},
		details: /**SCHEMA_DETAILS*/{
			"ContactCommunication": {
				"schemaName": "ContactCommunicationDetail",
				"filter": {
					"masterColumn": "Id",
					"detailColumn": "Contact"
				}
			},
			"Activities": {
				"schemaName": "ActivityDetailV2",
				"filter": {
					"masterColumn": "Id",
					"detailColumn": "Contact"
				},
				"defaultValues": {
					"Account": {
						"masterColumn": "Account"
					}
				},
				"filterMethod": "activitiesDetailFilter"
			},
			"Relationships": {
				"schemaName": "ContactRelationshipDetailV2",
				"filterMethod": "relationshipsDetailFilter",
				"defaultValues": {
					"ContactA": {
						"masterColumn": "Id"
					}
				}
			},
			"ContactCareer": {
				"schemaName": "ContactCareerDetailV2",
				"filter": {
					"masterColumn": "Id",
					"detailColumn": "Contact"
				},
				"defaultValues": {
					"Contact": {
						"masterColumn": "Id"
					}
				}
			},
			"Files": {
				"schemaName": "FileDetailV2",
				"entitySchemaName": "ContactFile",
				"filter": {
					"masterColumn": "Id",
					"detailColumn": "Contact"
				}
			},
			"ContactAddress": {
				"schemaName": "ContactAddressDetailV2",
				"filter": {
					"masterColumn": "Id",
					"detailColumn": "Contact"
				}
			},
			"ContactAnniversary": {
				"schemaName": "ContactAnniversaryDetailV2",
				"filter": {
					"masterColumn": "Id",
					"detailColumn": "Contact"
				},
				"subscriber": {
					"methodName": "sendSaveCardModuleResponse"
				}
			},
			"EmailDetailV2": {
				"schemaName": "EmailDetailV2",
				"filter": {
					"masterColumn": "Id",
					"detailColumn": "Contact"
				},
				"filterMethod": "emailDetailFilter"
			}
		}/**SCHEMA_DETAILS*/,
		modules: /**SCHEMA_MODULES*/{
			"AccountProfile": {
				"config": {
					"schemaName": "AccountProfileSchema",
					"isSchemaConfigInitialized": true,
					"useHistoryState": false,
					"parameters": {
						"viewModelConfig": {
							"masterColumnName": "Account"
						}
					}
				}
			},
			"ActionsDashboardModule": {
				"config": {
					"isSchemaConfigInitialized": true,
					"schemaName": "SectionActionsDashboard",
					"useHistoryState": false,
					"parameters": {
						"viewModelConfig": {
							"entitySchemaName": "Contact",
							"dashboardConfig": {
								"Activity": {
									"masterColumnName": "Id",
									"referenceColumnName": "Contact"
								}
							}
						}
					}
				}
			}
		}/**SCHEMA_MODULES*/,
		mixins: {
			/**
			 * @class TimezoneMixin Mixin.
			 */
			TimezoneMixin: "Terrasoft.TimezoneMixin",
			/**
			 * @class CommunicationSynchronizerMixin Mixin, used for sync communications.
			 */
			CommunicationSynchronizerMixin: "Terrasoft.CommunicationSynchronizerMixin",
			/**
			 * @class CommunicationOptionsMixin Mixin, implements communication options usage methods.
			 */
			CommunicationOptionsMixin: "Terrasoft.CommunicationOptionsMixin"
		},
		methods: {

			//region Methods: private

			/**
			 * Returns specification in lead detail id.
			 * @private
			 * @return {String} Detaild id.
			 */
			_getContactAnniversaryDetailId: function() {
				return this.getDetailId("ContactAnniversary");
			},

			//endregion

			//region Methods: protected

			/**
			 * Set/Reset birthday date.
			 * @protected
			 * @param {Date} newBirthdate New birthdate.
			 */
			onBirthdateChanged: function(newBirthdate) {
				var oldBirthDate = this.get("BirthDate");

				if (Ext.isEmpty(newBirthdate) && Ext.isEmpty(oldBirthDate)) {
					return;
				}
				if (Ext.isEmpty(newBirthdate) && !Ext.isEmpty(oldBirthDate)) {
					newBirthdate = null;
					this.set("BirthDate", newBirthdate);
					return;
				}

				this.set("BirthDate", newBirthdate, {silent: true});
				this.setAge(true);
			},

			/**
			 * @inheritdoc Terrasoft.BasePageV2#subscribeSandboxEvents
			 * @override
			 */
			subscribeSandboxEvents: function() {
				this.callParent(arguments);
				var contactAnniversaryDetailId = this._getContactAnniversaryDetailId();
				this.sandbox.subscribe("BirthdateChanged", this.onBirthdateChanged, this, [contactAnniversaryDetailId]);
			},

			/**
			 * Initialize system settings values.
			 * @protected
			 */
			initSysSettingsValues: function() {
				var sysSettingsNameArray = ["BuildType", "ActualizeAge"];
				this.Terrasoft.SysSettings.querySysSettings(sysSettingsNameArray, function(settingValues) {
					var buildTypeSetting = settingValues.BuildType;
					var buildType = buildTypeSetting && buildTypeSetting.value;
					this.set("canUseSocialFeaturesByBuildType",
						(buildType !== ConfigurationConstants.BuildType.Public));

					var isAgeActualizationEnabled = settingValues.ActualizeAge;
					this.set("IsAgeActualizationEnabled", isAgeActualizationEnabled);
				}, this);
			},

			/**
			 * @inheritdoc Terrasoft.BasePageV2#init
			 * @override
			 */
			init: function() {
				this.callParent(arguments);
				this.initSyncMailboxCount();
				this.initSysSettingsValues();
			},

			/**
			 * Check if birthday has already passed.
			 * @protected
			 * @param {Date} currentDate Current date.
			 * @param {Date} birthdate Birthdate.
			 * @return {Boolean}
			 */
			wasBirthdayThisYear: function(currentDate, birthdate) {
				var monthsDifference = currentDate.getMonth() - birthdate.getMonth();
				var daysDifference = currentDate.getDate() - birthdate.getDate();
				var hasBirthdayMonthPassed = monthsDifference > 0;
				var hasBirthdayPassedThisMonth = monthsDifference === 0 && daysDifference >= 0;

				return hasBirthdayMonthPassed || hasBirthdayPassedThisMonth;
			},

			/**
			 * Returns calcuated age.
			 * @protected
			 * @return {Number}
			 */
			getCalculatedAge: function(birthdate) {
				if (this.isDateGreaterThenCurrent(birthdate)) {
					return 0;
				}
				var currentDate = new Date();
				var fullYearsOld = currentDate.getFullYear() - birthdate.getFullYear();
				return this.wasBirthdayThisYear(currentDate, birthdate) ? fullYearsOld : fullYearsOld - 1;
			},

			/**
			 * Check if input date is greater then current date.
			 * @protected
			 * @param {Date} date Date.
			 * @return {Boolean}
			 */
			isDateGreaterThenCurrent: function(date) {
				return date > new Date();
			},

			/**
			 * Check if age actualization system setting is off.
			 * @protected
			 * @return {Boolean}
			 */
			checkIfAgeActualizationDisabled: function() {
				return !this.get("IsAgeActualizationEnabled");
			},

			/**
			 * Updates contact anniversary detail data.
			 * @param {Function} callback Callback function.
			 * @param {Object} scope Callback scope.
			 */
			updateContactAnniversaryDetail: function(callback, scope) {
				this.updateDetail({detail: "ContactAnniversary"});
				this.Ext.callback(callback, scope);
			},

			/**
			 * Check if current conditions allow to calculate age.
			 * @param {Date} date Date that is checked on emptiness.
			 * @param {Boolean}
			 */
			haveToCalculateAge: function (date) {
				return !(this.checkIfAgeActualizationDisabled() || Ext.isEmpty(date));
			},
			//endregion

			//region Methods: public

			/**
			 * Set contact age.
			 * @param {Boolean} silent Set with silent mode.
			 */
			setAge: function(silent) {
				var date = this.get("BirthDate");
				if (!this.haveToCalculateAge(date)) {
					return;
				}

				var age = this.getCalculatedAge(date);

				this.set("Age", age, {
					silent: silent
				});
			},

			//endregion

			/**
			 * @deprecated
			 */
			fillContactWithSocialNetworksData: function() {
				var confirmationMessage = this.get("Resources.Strings.OpenContactCardQuestion");
				var activeRowId = this.get("Id");
				var facebookId = this.get("FacebookId");
				var linkedInId = this.get("LinkedInId");
				var twitterId = this.get("TwitterId");
				if (facebookId !== "" || linkedInId !== "" || twitterId !== "") {
					this.sandbox.publish("PushHistoryState", {
						hash: "FillContactWithSocialAccountDataModule",
						stateObj: {
							FacebookId: facebookId,
							LinkedInId: linkedInId,
							TwitterId: twitterId,
							ContactId: activeRowId
						}
					});
				} else {
					Terrasoft.utils.showConfirmation(confirmationMessage, Ext.emptyFn, ["ok"], this);
				}
			},

			/**
			 * @inheritdoc Terrasoft.configuration.BaseSchemaViewModel#setValidationConfig
			 * @override
			 */
			setValidationConfig: function() {
				this.callParent(arguments);
				this.addColumnValidator("Email", EmailHelper.getEmailValidator);
			},

			/**
			 * Creates filters for activities detail.
			 */
			activitiesDetailFilter: function() {
				return Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
					"[ActivityParticipant:Activity].Participant.Id", this.get("Id"));
			},

			/**
			 * Creates filters for Email detail.
			 * @return {Terrasoft.FilterGroup} Filters.
			 */
			emailDetailFilter: function() {
				var filterGroup = new Terrasoft.createFilterGroup();
				filterGroup.logicalOperation = Terrasoft.LogicalOperatorType.AND;
				filterGroup.add(
					"ContactFilter",
					Terrasoft.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.EQUAL,
						"[ActivityParticipant:Activity].Participant.Id",
						this.get("Id")
					)
				);
				filterGroup.add(
					"EmailFilter",
					Terrasoft.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.EQUAL,
						"Type",
						ConfigurationConstants.Activity.Type.Email
					)
				);
				return filterGroup;
			},

			/**
			 * Creates filters for relationships detail.
			 */
			relationshipsDetailFilter: function() {
				var filterGroup = new Terrasoft.createFilterGroup();
				filterGroup.logicalOperation = Terrasoft.LogicalOperatorType.OR;
				filterGroup.add("ContactFilter", Terrasoft.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL, "Contact", this.get("Id")));
				return filterGroup;
			},

			/**
			 * Creates filters for history detail.
			 */
			historyDetailFilter: function() {
				var filterGroup = new Terrasoft.createFilterGroup();
				filterGroup.add("ContactFilter", Terrasoft.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL, "Contact", this.get("Id")));
				filterGroup.add("sysWorkspacedetailFilter", Terrasoft.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL,
					"SysEntity.SysWorkspace", Terrasoft.SysValue.CURRENT_WORKSPACE.value));
				return filterGroup;
			},

			/**
			 * @inheritdoc Terrasoft.BasePageV2#onEntityInitialized
			 * @override
			 */
			onEntityInitialized: function() {
				this.setIsEmailDetailVisible();
				this.callParent(arguments);
				Terrasoft.delay(this.mixins.TimezoneMixin.init, this, 1000);
			},

			/**
			 * @obsolete
			 */
			getSrcMethod: function() {
				return this.getContactImage();
			},

			/**
			 * ########## web-##### ########## ########.
			 * @private
			 * @return {String} Web-##### ########## ########.
			 */
			getContactImage: function() {
				var primaryImageColumnValue = this.get(this.primaryImageColumnName);
				if (primaryImageColumnValue) {
					return this.getSchemaImageUrl(primaryImageColumnValue);
				}
				return this.getContactDefaultImage();
			},

			/**
			 * ########## web-##### ########## ######## ## #########.
			 * @private
			 * @return {String} Web-##### ########## ######## ## #########.
			 */
			getContactDefaultImage: function() {
				return Terrasoft.ImageUrlBuilder.getUrl(this.get("Resources.Images.DefaultPhoto"));
			},

			/**
			 * ############ ######### ########## ########.
			 * @private
			 * @param {File} photo ##########.
			 */
			onPhotoChange: function(photo) {
				if (!photo) {
					this.set(this.primaryImageColumnName, null);
					return;
				}
				Terrasoft.ImageApi.upload({
					file: photo,
					onComplete: this.onPhotoUploaded,
					onError: this.onPhotoChangeError,
					scope: this
				});
			},

			onPhotoChangeError: function(imageId, error, xhr) {
				if (xhr.response) {
					var response = Terrasoft.decode(xhr.response);
					if (response.error) {
						Terrasoft.showMessage(response.error);
					}
				}
			},

			onPhotoUploaded: function(imageId) {
				var imageData = {
					value: imageId,
					displayValue: "Photo"
				};
				this.set(this.primaryImageColumnName, imageData);
			},

			/**
			 * @inheritdoc Terrasoft.BasePageV2#save
			 * @override
			 */
			save: function() {
				this.clearChangedValuesSynchronizedByDetail();
				this.callParent(arguments);
			},

			/**
			 * @inheritdoc Terrasoft.BasePageV2#onSaved
			 * @override
			 */
			onSaved: function() {
				if (this.get("CallParentOnSaved")) {
					this.set("CallParentOnSaved", false);
					this.callParent(arguments);
				} else {
					this.set("ParentOnSavedArguments", arguments);
					Terrasoft.chain(
						this.updateAccountPrimaryContact,
						this.updateCareerDetail,
						this.updateContactAnniversaryDetail,
						this.callParentOnSaved,
						this
					);
				}
			},

			/**
			 * ####### ############ ##### onSaved
			 * @protected
			 */
			callParentOnSaved: function() {
				this.set("CallParentOnSaved", true);
				this.onSaved.apply(this, this.get("ParentOnSavedArguments"));
			},

			/**
			 * Updates contact career detail.
			 * @protected
			 * @param {Function} callback Callback function.
			 */
			updateCareerDetail: function(callback) {
				this.updateDetail({detail: "ContactCareer"});
				callback.call(this);
			},

			/**
			 * ######### ###### ##### ######### ## ###### ####### ########
			 * @deprecated
			 */
			updateCareerDetails: function() {
				this.setAccountIsEmpty();
				this.setIsCareerPropertyChanged();
				this.updateDetails(arguments);
			},

			/**
			 * ######### ######### ########## # ####### ########.
			 * ######### ### ######## ###### ## ###### ####### ########.
			 * 1. #### #### «##########» # ######## ####### - ##### # ###### ###### ## ##### ###########
			 * # ########## «#######» # «########» # # #### ###### ########## #### ########## = ####### ####
			 * # ##### ####### «#######». ###### ######## ## #####.
			 * 2. #### #### «##########» #### ########, # ##### #### #### ######, ## ######### ##### ######
			 * # ###### «#######» ###### ### #### ## #########.
			 * 3. #####, ### ##### ###### ########## # #####
			 * (##########, #########, ###### ######## #########, ###########), ########### # #############
			 * # ####### ## ###### ####### #########: #### ### ###### ###### ##### ## ########## ###### #
			 * ####### # ########## "########" # "#######", ## ########## ######### ##### ###### # #####
			 * ##########. #### ##### ############ ###### ###### # ######### ####### – ####### # ### #######
			 * "#######" # ######### #### ########## ####### #####.
			 * @protected
			 * @param {Function} callback ####### ######### ######.
			 * @deprecated
			 */
			changeCareer: function(callback) {
				var account = this.get("Account");
				var accountWasEmpty = this.get("AccountIsEmpty");
				if (!account && !accountWasEmpty) {
					this.updateCurrentCareerInfo(callback);
					return;
				}
				var addMode = this.isAddMode();
				var copyMode = this.isCopyMode();
				if (account && (accountWasEmpty || addMode || copyMode)) {
					this.addNewCareerInfo(callback);
					return;
				}
				var careerPropertyChanged = this.get("IsCareerPropertyChanged");
				var primaryContactAdd = this.get("PrimaryContactAdd");
				if (careerPropertyChanged && !primaryContactAdd && !copyMode) {
					this.promtAddNewCareerInfo(callback);
					return;
				}
				if (callback) {
					callback.call(this);
				}
			},

			/**
			 * ############ ####### ########## ######### ########## # ####### ########.
			 * ######### ###### ####### ########.
			 * @private
			 * @param {Function} callback ####### ######### ######.
			 * @deprecated
			 */
			onCareerInfoChanged: function(callback) {
				this.updateDetails();
				callback.call(this);
			},

			/**
			 * ###### ###### ############ # ############# ########## ###### ## ###### ####### ########.
			 * @private
			 * @param {Function} callback ####### ######### ######.
			 * @deprecated
			 */
			promtAddNewCareerInfo: function(callback) {
				var message = this.get("Resources.Strings.ContactCareerInfoChanged");
				var buttons = Terrasoft.MessageBoxButtons;
				this.showConfirmationDialog(message, function(returnCode) {
					this.promtAddNewCareerInfoHandler(returnCode, callback);
				}, [buttons.YES.returnCode, buttons.NO.returnCode]);
			},

			/**
			 * ############ ##### ############ ## ###### # ############# ########## ######
			 * ## ###### ####### ########.
			 * @private
			 * @param {String} returnCode ### ########## ######## ######.
			 * @param {Function} callback ####### ######### ######.
			 * @deprecated
			 */
			promtAddNewCareerInfoHandler: function(returnCode, callback) {
				if (returnCode === Terrasoft.MessageBoxButtons.YES.returnCode) {
					this.addNewCareerInfo(callback);
					return;
				}
				callback();
			},

			/**
			 * ######### ###### ## ###### ####### ########.
			 * ######### ############ ###### ## ###### # ######### "#######".
			 * @param {Function} callback ####### ######### ######.
			 * @deprecated
			 */
			addNewCareerInfo: function(callback) {
				var addMode = this.isAddMode();
				var copyMode = this.isCopyMode();
				var batchQuery = Ext.create("Terrasoft.BatchQuery");
				if (!addMode || !copyMode) {
					var updateCurrentCareerInfo = this.getUpdateCurrentCareerInfo();
					batchQuery.add(updateCurrentCareerInfo);
				}
				var insertContactCareerQuery = this.getInsertContactCareerQuery();
				batchQuery.add(insertContactCareerQuery);
				batchQuery.execute(function() {
					this.onCareerInfoChanged(callback);
				}, this);
			},

			/**
			 * ######### ############ ###### ## ###### ####### ######## # ######### "#######".
			 * @param {Function} callback ####### ######### ######.
			 * @deprecated
			 */
			updateCurrentCareerInfo: function(callback) {
				var updateCurrentCareerInfo = this.getUpdateCurrentCareerInfo();
				updateCurrentCareerInfo.execute(function() {
					this.onCareerInfoChanged(callback);
				}, this);
			},

			/**
			 * ######### ###### ####### ###### ####### ########.
			 * @return {Terrasoft.InsertQuery} ###### ####### ###### ####### ########.
			 * @deprecated
			 */
			getInsertContactCareerQuery: function() {
				var insert = Ext.create("Terrasoft.InsertQuery", {
					rootSchema: ContactCareer
				});
				var account = this.getLookupValue("Account");
				if (!Ext.isEmpty(account)) {
					insert.setParameterValue("Account", account);
				}
				var job = this.getLookupValue("Job");
				if (!Ext.isEmpty(job)) {
					insert.setParameterValue("Job", job);
				}
				var jobTitle = this.get("JobTitle");
				if (!Ext.isEmpty(jobTitle)) {
					insert.setParameterValue("JobTitle", jobTitle);
				}
				var department = this.getLookupValue("Department");
				if (!Ext.isEmpty(department)) {
					insert.setParameterValue("Department", department);
				}
				var decisionRole = this.getLookupValue("DecisionRole");
				if (!Ext.isEmpty(decisionRole)) {
					insert.setParameterValue("DecisionRole", decisionRole);
				}
				insert.setParameterValue("Contact", this.get("Id"));
				insert.setParameterValue("Current", true);
				insert.setParameterValue("Primary", true);
				return insert;
			},

			/**
			 * @deprecated
			 */
			getUpdateContactCareerQuery: function(notUpdate) {
				var update = Ext.create("Terrasoft.UpdateQuery", {
					rootSchemaName: "ContactCareer"
				});
				var filters = update.filters;
				var idContact = this.get("Id");
				var idFilter = Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
					"Contact", idContact);
				filters.add("IdFilter", idFilter);
				if (notUpdate) {
					update.setParameterValue("Current", false, Terrasoft.DataValueType.BOOLEAN);
					update.setParameterValue("DueDate", new Date(), Terrasoft.DataValueType.DATE);
				} else {
					var currentFilter = Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
						"Current", true);
					filters.add("currentFilter", currentFilter);
					var primaryFilter = Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
						"Primary", true);
					filters.add("primaryFilter", primaryFilter);
					var account = this.getLookupValue("Account");
					var job = this.getLookupValue("Job");
					var jobTitle = this.get("JobTitle");
					var department = this.getLookupValue("Department");
					if (!Ext.isEmpty(account)) {
						update.setParameterValue("Account", account, Terrasoft.DataValueType.GUID);
					}
					if (!Ext.isEmpty(job)) {
						update.setParameterValue("Job", job, Terrasoft.DataValueType.GUID);
					}
					if (!Ext.isEmpty(jobTitle)) {
						update.setParameterValue("JobTitle", jobTitle, Terrasoft.DataValueType.TEXT);
					}
					if (!Ext.isEmpty(department)) {
						update.setParameterValue("Department", department, Terrasoft.DataValueType.GUID);
					}
				}
				return update;
			},

			/**
			 * ########## ###### ## ########## ############ ####### ## ###### ####### ########
			 * # ######### "#######".
			 * @return {Terrasoft.UpdateQuery} ###### ## ########## ############ ####### ## ###### #######
			 *     ######## # ######### "#######".
			 * @deprecated
			 */
			getUpdateCurrentCareerInfo: function() {
				var query = Ext.create("Terrasoft.UpdateQuery", {
					rootSchema: ContactCareer
				});
				query.filters.addItem(Terrasoft.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL, "Contact", this.get("Id")));
				query.filters.addItem(Terrasoft.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL, "Current", true));
				query.setParameterValue("Current", false);
				query.setParameterValue("DueDate", new Date());
				return query;
			},

			/**
			 * ######### ######## ####### ###########.
			 * @private
			 * @param {Function} callback ####### ######### ######.
			 */
			updateAccountPrimaryContact: function(callback) {
				var account = this.getLookupValue("Account");
				if (!this.isAddMode() || Ext.isEmpty(account) || !this.get("PrimaryContactAdd")) {
					if (callback) {
						callback.call(this);
					}
				} else {
					var update = Ext.create("Terrasoft.UpdateQuery", {rootSchemaName: "Account"});
					update.enablePrimaryColumnFilter(account);
					update.setParameterValue("PrimaryContact", this.get("Id"), Terrasoft.DataValueType.LOOKUP);
					var batch = Ext.create("Terrasoft.BatchQuery");
					batch.add(update, function() {
					}, this);
					batch.execute(function() {
						this.updateDetails();
						if (callback) {
							callback.call(this);
						}
					}, this);
				}
			},

			/**
			 * @deprecated
			 */
			getSelectedButton: function(returnCode, callback) {
				if (returnCode === Terrasoft.MessageBoxButtons.YES.returnCode) {
					var account = this.get("Account");
					var batch = Ext.create("Terrasoft.BatchQuery");
					batch.add(this.getUpdateContactCareerQuery(true), function() {
					}, this);
					if (!Ext.isEmpty(account)) {
						batch.add(this.getInsertContactCareerQuery(), function() {
						}, this);
					}
					batch.execute(function() {
						this.updateCareerDetails();
						if (callback) {
							callback.call(this);
						}
					}, this);
				} else {
					this.getUpdateContactCareerQuery().execute(function() {
						this.updateCareerDetails();
						if (callback) {
							callback.call(this);
						}
					}, this);
				}
			},

			/**
			 * ######### #### ## ######### # ##### ##########, #########, ###### ######## #########,
			 * ###########.
			 * @protected
			 * @return {Boolean} ######### ########.
			 * @deprecated
			 */
			isCareerPropertyChanged: function() {
				var values = this.changedValues;
				return values && (values.Account || values.Job || values.JobTitle || values.Department);
			},

			/**
			 * Sets the flag changes to contact the career fields.
			 * @deprecated
			 */
			setIsCareerPropertyChanged: function() {
				this.set("IsCareerPropertyChanged", this.isCareerPropertyChanged());
			},

			/**
			 * Updates job full title field on job change.
			 */
			jobChanged: function() {
				var job = this.get("Job");
				var jobTitle = this.get("JobTitle");
				if (this.isNotEmpty(job) && this.isEmpty(jobTitle)) {
					this.set("JobTitle", job.displayValue);
				}
			},

			/**
			 * Sets "AccountIsEmpty" tag.
			 * Used when checked account field changes.
			 * @private
			 * @deprecated
			 */
			setAccountIsEmpty: function() {
				this.set("AccountIsEmpty", Ext.isEmpty(this.get("Account")));
			},

			/**
			 * Returns id for contact type employee.
			 * @private
			 * @return {string} Contact type employee id.
			 */
			getEmployeeTypeId: function() {
				return ConfigurationConstants.ContactType.Employee.toLowerCase();
			},

			/**
			 * Returns id for account type our company.
			 * @private
			 * @return {string} Account type our company.
			 */
			getOurCompanyTypeId: function() {
				return ConfigurationConstants.AccountType.OurCompany.toLowerCase();
			},

			/**
			 * Sets email detail visibility.
			 * @protected
			 */
			setIsEmailDetailVisible: function() {
				var contactType = this.get("Type");
				var account = this.get("Account");
				var isContactTypeEmployee = (!Ext.isEmpty(contactType) &&
					contactType.value.toLowerCase() === this.getEmployeeTypeId());
				var isAccountOurCompany = (!Ext.isEmpty(account) && !Ext.isEmpty(account.Type) &&
					account.Type.value.toLowerCase() === this.getOurCompanyTypeId());
				var isDetailVisible = !(isContactTypeEmployee || isAccountOurCompany);
				this.set("IsEmailDetailVisible", isDetailVisible);
			},

			/**
			 * @inheritdoc Terrasoft.BasePageV2#onDetailChanged
			 */
			onDetailChanged: function(detail) {
				this.callParent(arguments);
				if (detail.schemaName === "ContactAddressDetailV2") {
					this.updateTimezone();
				}
			},

			/**
			 * Check feature status.
			 */
			isMultiLanguage: function() {
				return this.getIsFeatureEnabled("EmailMessageMultiLanguage") ||
					this.getIsFeatureEnabled("EmailMessageMultiLanguageV2");
			},

			/**
			 * Updates the time zone information.
			 */
			updateTimezone: function() {
				this.mixins.TimezoneMixin.init.call(this);
			},

			/**
			 * Starts call in CTI panel.
			 * @param {String} number Phone number to call.
			 * @return {Boolean} False, to stop click event propagation.
			 */
			onCallClick: function(number) {
				return this.callContact(number, this.$Id, this.$Account);
			}
		},
		dataModels: /**SCHEMA_DATA_MODELS*/{}/**SCHEMA_DATA_MODELS*/,
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "insert",
				"name": "PhotoTimeZoneContainer",
				"values": {
					"itemType": 7,
					"wrapClass": [
						"photo-timezone-container"
					],
					"layout": {
						"colSpan": 24,
						"rowSpan": 1,
						"column": 0,
						"row": 0
					},
					"items": []
				},
				"parentName": "ProfileContainer",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "AccountPhotoContainer",
				"values": {
					"itemType": 7,
					"wrapClass": [
						"image-edit-container"
					],
					"items": []
				},
				"parentName": "PhotoTimeZoneContainer",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "Photo",
				"values": {
					"getSrcMethod": "getContactImage",
					"onPhotoChange": "onPhotoChange",
					"readonly": false,
					"defaultImage": {
						"bindTo": "getContactDefaultImage"
					},
					"generator": "ImageCustomGeneratorV2.generateCustomImageControl"
				},
				"parentName": "AccountPhotoContainer",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "TimezoneContactPage",
				"values": {
					"itemType": 7,
					"generator": "TimezoneGenerator.generateTimeZone",
					"wrapClass": [
						"timezone-container"
					],
					"visible": true,
					"timeZoneCaption": {
						"bindTo": "TimeZoneCaption"
					},
					"timeZoneCity": {
						"bindTo": "TimeZoneCity"
					},
					"tips": []
				},
				"parentName": "PhotoTimeZoneContainer",
				"propertyName": "items",
				"index": 1
			},
			{
				"operation": "insert",
				"name": "AccountName",
				"values": {
					"bindTo": "Name",
					"layout": {
						"colSpan": 24,
						"rowSpan": 1,
						"column": 0,
						"row": 1
					}
				},
				"parentName": "ProfileContainer",
				"propertyName": "items",
				"index": 1
			},
			{
				"operation": "insert",
				"name": "JobTitleProfile",
				"values": {
					"bindTo": "JobTitle",
					"layout": {
						"colSpan": 24,
						"rowSpan": 1,
						"column": 0,
						"row": 2
					}
				},
				"parentName": "ProfileContainer",
				"propertyName": "items",
				"index": 2
			},
			{
				"operation": "insert",
				"name": "AccountMobilePhone",
				"values": {
					"className": "Terrasoft.PhoneEdit",
					"bindTo": "MobilePhone",
					"showValueAsLink": {
						"bindTo": "isTelephonyEnabled"
					},
					"href": {
						"bindTo": "MobilePhone",
						"bindConfig": {
							"converter": "getLinkValue"
						}
					},
					"linkclick": {
						"bindTo": "onCallClick"
					},
					"contentType": 3,
					"layout": {
						"colSpan": 24,
						"rowSpan": 1,
						"column": 0,
						"row": 3
					},
					"controlConfig": {
						"autocomplete": "2e3c0f3e-3bc2-4e23-b17e-da4a6b4607b8"
					}
				},
				"parentName": "ProfileContainer",
				"propertyName": "items",
				"index": 3
			},
			{
				"operation": "insert",
				"name": "AccountPhone",
				"values": {
					"className": "Terrasoft.PhoneEdit",
					"bindTo": "Phone",
					"showValueAsLink": {
						"bindTo": "isTelephonyEnabled"
					},
					"href": {
						"bindTo": "Phone",
						"bindConfig": {
							"converter": "getLinkValue"
						}
					},
					"linkclick": {
						"bindTo": "onCallClick"
					},
					"contentType": 3,
					"layout": {
						"colSpan": 24,
						"rowSpan": 1,
						"column": 0,
						"row": 4
					},
					"controlConfig": {
						"autocomplete": "7c21efae-5da3-4f31-a8f0-94a63f97b4fc"
					}
				},
				"parentName": "ProfileContainer",
				"propertyName": "items",
				"index": 4
			},
			{
				"operation": "insert",
				"name": "AccountEmail",
				"values": {
					"bindTo": "Email",
					"showValueAsLink": true,
					"href": {
						"bindTo": "Email",
						"bindConfig": {
							"converter": "getLinkValue"
						}
					},
					"linkclick": {
						"bindTo": "sendEmail"
					},
					"contentType": 3,
					"layout": {
						"colSpan": 24,
						"rowSpan": 1,
						"column": 0,
						"row": 5
					},
					"controlConfig": {
						"autocomplete": "daa099f3-8572-4322-9677-78265b2b6fe3"
					}
				},
				"parentName": "ProfileContainer",
				"propertyName": "items",
				"index": 5
			},
			{
				"operation": "insert",
				"name": "Region01d9bb70-1f40-4da9-bf6d-df3266acf28e",
				"values": {
					"layout": {
						"colSpan": 24,
						"rowSpan": 1,
						"column": 0,
						"row": 6,
						"layoutName": "ProfileContainer"
					},
					"bindTo": "Region"
				},
				"parentName": "ProfileContainer",
				"propertyName": "items",
				"index": 6
			},
			{
				"operation": "insert",
				"name": "Header",
				"values": {
					"itemType": 0,
					"items": [],
					"collapseEmptyRow": true,
					"classes": {
						"wrapClassName": [
							"profile-container",
							"autofill-layout"
						]
					}
				},
				"parentName": "LeftModulesContainer",
				"propertyName": "items",
				"index": 1
			},
			{
				"operation": "insert",
				"name": "AccountProfile",
				"values": {
					"itemType": 4
				},
				"parentName": "LeftModulesContainer",
				"propertyName": "items",
				"index": 3
			},
			{
				"operation": "insert",
				"name": "ActionsDashboardModule",
				"values": {
					"classes": {
						"wrapClassName": [
							"actions-dashboard-module"
						]
					},
					"itemType": 4
				},
				"parentName": "ActionDashboardContainer",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "merge",
				"name": "HeaderContainer",
				"values": {
					"wrapClass": [
						"header-container-margin-bottom",
						"width-auto"
					]
				}
			},
			{
				"operation": "insert",
				"name": "GeneralInfoTab",
				"values": {
					"caption": {
						"bindTo": "Resources.Strings.GeneralInfoTabCaption"
					},
					"items": [],
					"order": 0
				},
				"parentName": "Tabs",
				"propertyName": "tabs",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "ContactGeneralInfoControlGroup",
				"values": {
					"itemType": 15,
					"items": []
				},
				"parentName": "GeneralInfoTab",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "ContactGeneralInfoBlock",
				"values": {
					"itemType": 0,
					"items": [],
					"collapseEmptyRow": true
				},
				"parentName": "ContactGeneralInfoControlGroup",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "Type",
				"values": {
					"contentType": 3,
					"layout": {
						"colSpan": 12,
						"rowSpan": 1,
						"column": 0,
						"row": 0
					}
				},
				"parentName": "ContactGeneralInfoBlock",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "Owner",
				"values": {
					"layout": {
						"colSpan": 12,
						"rowSpan": 1,
						"column": 12,
						"row": 0
					},
					"tip": {
						"content": {
							"bindTo": "Resources.Strings.OwnerTip"
						}
					}
				},
				"parentName": "ContactGeneralInfoBlock",
				"propertyName": "items",
				"index": 1
			},
			{
				"operation": "insert",
				"name": "SalutationType",
				"values": {
					"contentType": 3,
					"layout": {
						"colSpan": 12,
						"rowSpan": 1,
						"column": 0,
						"row": 1
					}
				},
				"parentName": "ContactGeneralInfoBlock",
				"propertyName": "items",
				"index": 2
			},
			{
				"operation": "insert",
				"name": "Gender",
				"values": {
					"contentType": 3,
					"layout": {
						"colSpan": 12,
						"rowSpan": 1,
						"column": 12,
						"row": 1
					}
				},
				"parentName": "ContactGeneralInfoBlock",
				"propertyName": "items",
				"index": 3
			},
			{
				"operation": "insert",
				"name": "Age",
				"values": {
					"contentType": 3,
					"layout": {
						"colSpan": 12,
						"rowSpan": 1,
						"column": 0,
						"row": 2
					},
					"enabled": {
						"bindTo": "checkIfAgeActualizationDisabled"
					}
				},
				"parentName": "ContactGeneralInfoBlock",
				"propertyName": "items",
				"index": 4
			},
			{
				"operation": "insert",
				"name": "Language",
				"values": {
					"contentType": 3,
					"layout": {
						"colSpan": 12,
						"rowSpan": 1,
						"column": 12,
						"row": 2
					},
					"visible": {
						"bindTo": "isMultiLanguage"
					},
					"tip": {
						"content": {
							"bindTo": "Resources.Strings.PreferredLanguageTipMessage"
						}
					}
				},
				"parentName": "ContactGeneralInfoBlock",
				"propertyName": "items",
				"index": 5
			},
			{
				"operation": "insert",
				"name": "ContactCommunication",
				"values": {
					"itemType": 2
				},
				"parentName": "GeneralInfoTab",
				"propertyName": "items",
				"index": 1
			},
			{
				"operation": "insert",
				"name": "ContactAddress",
				"values": {
					"itemType": 2
				},
				"parentName": "GeneralInfoTab",
				"propertyName": "items",
				"index": 2
			},
			{
				"operation": "insert",
				"name": "ContactAnniversary",
				"values": {
					"itemType": 2
				},
				"parentName": "GeneralInfoTab",
				"propertyName": "items",
				"index": 3
			},
			{
				"operation": "insert",
				"name": "Relationships",
				"values": {
					"itemType": 2
				},
				"parentName": "GeneralInfoTab",
				"propertyName": "items",
				"index": 4
			},
			{
				"operation": "insert",
				"name": "JobTabContainer",
				"values": {
					"caption": {
						"bindTo": "Resources.Strings.JobTabCaption"
					},
					"items": [],
					"order": 1
				},
				"parentName": "Tabs",
				"propertyName": "tabs",
				"index": 1
			},
			{
				"operation": "insert",
				"name": "JobInformationControlGroup",
				"values": {
					"itemType": 15,
					"items": []
				},
				"parentName": "JobTabContainer",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "JobInformationBlock",
				"values": {
					"itemType": 0,
					"items": []
				},
				"parentName": "JobInformationControlGroup",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "Job",
				"values": {
					"contentType": 3,
					"layout": {
						"colSpan": 12,
						"rowSpan": 1,
						"column": 0,
						"row": 0
					}
				},
				"parentName": "JobInformationBlock",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "JobTitle",
				"values": {
					"layout": {
						"colSpan": 12,
						"rowSpan": 1,
						"column": 12,
						"row": 0
					}
				},
				"parentName": "JobInformationBlock",
				"propertyName": "items",
				"index": 1
			},
			{
				"operation": "insert",
				"name": "Department",
				"values": {
					"contentType": 3,
					"layout": {
						"colSpan": 12,
						"rowSpan": 1,
						"column": 0,
						"row": 1
					}
				},
				"parentName": "JobInformationBlock",
				"propertyName": "items",
				"index": 2
			},
			{
				"operation": "insert",
				"name": "DecisionRole",
				"values": {
					"contentType": 3,
					"layout": {
						"colSpan": 12,
						"rowSpan": 1,
						"column": 12,
						"row": 1
					}
				},
				"parentName": "JobInformationBlock",
				"propertyName": "items",
				"index": 3
			},
			{
				"operation": "insert",
				"name": "ContactCareer",
				"values": {
					"itemType": 2
				},
				"parentName": "JobTabContainer",
				"propertyName": "items",
				"index": 1
			},
			{
				"operation": "insert",
				"name": "HistoryTab",
				"values": {
					"caption": {
						"bindTo": "Resources.Strings.HistoryTabCaption"
					},
					"items": [],
					"order": 2
				},
				"parentName": "Tabs",
				"propertyName": "tabs",
				"index": 2
			},
			{
				"operation": "insert",
				"name": "Activities",
				"values": {
					"itemType": 2
				},
				"parentName": "HistoryTab",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "EmailDetailV2",
				"values": {
					"itemType": 2,
					"visible": {
						"bindTo": "IsEmailDetailVisible"
					}
				},
				"parentName": "HistoryTab",
				"propertyName": "items",
				"index": 1
			},
			{
				"operation": "insert",
				"name": "NotesAndFilesTab",
				"values": {
					"caption": {
						"bindTo": "Resources.Strings.NotesAndFilesTabCaption"
					},
					"items": [],
					"order": 4
				},
				"parentName": "Tabs",
				"propertyName": "tabs",
				"index": 3
			},
			{
				"operation": "insert",
				"name": "Files",
				"values": {
					"itemType": 2
				},
				"parentName": "NotesAndFilesTab",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "NotesControlGroup",
				"values": {
					"itemType": 15,
					"items": [],
					"caption": {
						"bindTo": "Resources.Strings.NotesGroupCaption"
					}
				},
				"parentName": "NotesAndFilesTab",
				"propertyName": "items",
				"index": 1
			},
			{
				"operation": "insert",
				"name": "Notes",
				"values": {
					"contentType": 4,
					"layout": {
						"column": 0,
						"row": 0,
						"colSpan": 24
					},
					"labelConfig": {
						"visible": false
					},
					"controlConfig": {
						"imageLoaded": {
							"bindTo": "insertImagesToNotes"
						},
						"images": {
							"bindTo": "NotesImagesCollection"
						}
					}
				},
				"parentName": "NotesControlGroup",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "merge",
				"name": "ESNTab",
				"values": {
					"order": 5
				}
			},
			{
				"operation": "remove",
				"name": "Header"
			}
		]/**SCHEMA_DIFF*/
	};
});