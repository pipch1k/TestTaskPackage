define("NsMedicalPrograms1Section1Page", [], function() {
	return {
		entitySchemaName: "NsMedicalPrograms1Section",
		 "attributes": {
			/* Атрибут, который хранит текущее количество активных ежедневных лечебных программ. */
            "responseCollectionMedicalProgram": {
                "dataValueType": Terrasoft.DataValueType.INTEGER,
                "type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
            },
            /* Атрибут, который хранит значение системной настройки максимального количесва лечебных программ. */
            "maximumDailyActiveProgram": {
                "dataValueType": Terrasoft.DataValueType.INTEGER,
                "type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
            },
			 "NsResponsible": {
  		       "dataValueType": Terrasoft.DataValueType.LOOKUP,
  		       "lookupListConfig": {
    		        "filters": [
                        function() {
                           var filterGroup = Ext.create("Terrasoft.FilterGroup");
						   filterGroup.add("Id",Terrasoft.createColumnIsNotNullFilter("Id"));
       		             //Фильтр для выбора только тех пользователей, у которых роль "Сотрудник"
        		           filterGroup.add("OrderFilter",
										   Terrasoft.createColumnFilterWithParameter(
							   Terrasoft.ComparisonType.EQUAL,"Type.Name","Сотрудник"));
               		     // Возвращаем группу фильтров
               		     return filterGroup;
               		 }
                    ]
                }
            },
			 "NsPeriodicity": {
    			lookupListConfig: {
	   			 orders: [
					{
			  		  columnPath: "Order", 
						direction: Terrasoft.OrderDirection.ASC
						}
						]
					}
				}
        },
		modules: /**SCHEMA_MODULES*/{}/**SCHEMA_MODULES*/,
		details: /**SCHEMA_DETAILS*/{
			"Files": {
				"schemaName": "FileDetailV2",
				"entitySchemaName": "NsMedicalPrograms1SectionFile",
				"filter": {
					"masterColumn": "Id",
					"detailColumn": "NsMedicalPrograms1Section"
				}
			},
			"NsSessions": {
				"schemaName": "Schema0509a03cDetail",
				"entitySchemaName": "NsSessions",
				"filter": {
					"detailColumn": "NsMedicalPrograms1Section",
					"masterColumn": "Id"
				}
			}
		}/**SCHEMA_DETAILS*/,
		businessRules: /**SCHEMA_BUSINESS_RULES*/{}/**SCHEMA_BUSINESS_RULES*/,
		methods:{
            /* Переопределение базового метода Terrasoft.BasePageV2.onEntityInitialized, который срабатывает после окончания инициализации схемы объекта страницы записи. */
            onEntityInitialized: function() {
                /* Вызывается родительская реализация метода. */
                this.callParent(arguments);
				this.getPeriodicityActiveNumber();
                this.getMaximumDailyActiveSections();
                /* Код генерируется, если создается новый элемент или копия существующего. */
                if (this.isAddMode() || this.isCopyMode()) {
                    /* Вызов базового метода Terrasoft.BasePageV2.getIncrementCode, который генерирует номер по ранее заданной маске. */
                    this.getIncrementCode(function(response) {
                        /* Сгенерированный номер возвращается в колонку [Code]. */
                        this.set("NsCode", response);
                    });
                }
            },
		/* Вычисляет текущее количество активных ежедневных лечебных программ и записывает полученное значение в атрибут "responseCollectionMedicalProgram". */
            getPeriodicityActiveNumber: function() {
                var periodicity = "Ежедневно";
                var esqPeriodicity = this.Ext.create("Terrasoft.EntitySchemaQuery", {
                    rootSchemaName: "NsMedicalPrograms1Section"
                });
                esqPeriodicity.addColumn("Name");
                var groupFilters = this.Ext.create("Terrasoft.FilterGroup");
                var filterPerodicity = this.Terrasoft.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL, "NsPeriodicity.Name", periodicity);
                var thisId = this.get("Id");
                var filterId = this.Terrasoft.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.NOT_EQUAL, "Id", thisId);
                var filterIsActive = this.Terrasoft.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL, "NsIsActive", true);
                groupFilters.addItem(filterPerodicity);
                groupFilters.logicalOperation = this.Terrasoft.LogicalOperatorType.AND;
                groupFilters.addItem(filterIsActive);
                groupFilters.logicalOperation = this.Terrasoft.LogicalOperatorType.AND;
                groupFilters.addItem(filterId);
                esqPeriodicity.filters.add(groupFilters);
                esqPeriodicity.getEntityCollection(function(result) {
                    if (!result.success) {
                        this.showInformationDialog("Request error");
                        return;
                    }
                    else {
                        var lengthCollection = result.collection.collection.length;
                        this.set("responseCollectionMedicalProgram", lengthCollection);
                    }
                }, this);
            },
           /* Добавляет валидацию к полю "Периодичность". При изменении данного поля либо сохранении записи будет вызываться метод-валидатор. */
            setValidationConfig: function() {
                this.callParent(arguments);
                this.addColumnValidator("NsPeriodicity", this.periodicityValidator);
            },
            /* Метод-валидатор — если лечебная программа ежедневная, сравнивает текущее количество активных ежедневных программ с системной настройкой "NsSessionsMaxNumber" и в случае превышения добавляет в поле "Периодичность" предупреждающее сообщение. Сохранение записи в таком случае невозможно. */
            periodicityValidator: function() {
                var invalidMessage= "";
                var periodicity = this.get("NsPeriodicity").displayValue;
                if (periodicity==="Ежедневно") {
                    var isActive = this.get("NsIsActive");
                    var myVariable = this.get("maximumDailyActiveProgram");
                    var lengthCollection = this.get("responseCollectionMedicalProgram");
                    if (lengthCollection >= myVariable && isActive) {
                        invalidMessage = "Число активных ежедневных лечебных программ ограничено. Не более " + myVariable + " программ.";
                    }
                }
                else {
                    invalidMessage = "";
                }
                return {
                    invalidMessage: invalidMessage
                };
            },
            /* Получает значение системной настройки "GymsNumber". */
            getMaximumDailyActiveSections: function() {
                var myVariable;
                var callback = function(value) {
                    myVariable = value;
                };
                this.Terrasoft.SysSettings.querySysSettingsItem("NsSessionsMaxNumber", callback, this);
                if (myVariable === undefined) {
                    return;
                }
                else {
                    this.set("maximumDailyActiveProgram", myVariable);
                }
            }
        },
		dataModels: /**SCHEMA_DATA_MODELS*/{}/**SCHEMA_DATA_MODELS*/,
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "insert",
				"name": "Namefa33be38-d24c-4cd6-81e2-5073b64ec919",
				"values": {
					"layout": {
						"colSpan": 24,
						"rowSpan": 1,
						"column": 0,
						"row": 0,
						"layoutName": "ProfileContainer"
					},
					"bindTo": "Name",
					"enabled": true
				},
				"parentName": "ProfileContainer",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "STRING2d84c65a-bc4c-434b-a4e3-781278f1d9b8",
				"values": {
					"layout": {
						"colSpan": 24,
						"rowSpan": 1,
						"column": 0,
						"row": 1,
						"layoutName": "ProfileContainer"
					},
					"bindTo": "NsCode",
					"enabled": true
				},
				"parentName": "ProfileContainer",
				"propertyName": "items",
				"index": 1
			},
			{
				"operation": "insert",
				"name": "LOOKUPe49b73a0-6514-41ff-97c5-59f56d2735aa",
				"values": {
					"layout": {
						"colSpan": 24,
						"rowSpan": 1,
						"column": 0,
						"row": 2,
						"layoutName": "ProfileContainer"
					},
					"bindTo": "NsPeriodicity",
					"enabled": true,
					"contentType": 3
				},
				"parentName": "ProfileContainer",
				"propertyName": "items",
				"index": 2
			},
			{
				"operation": "insert",
				"name": "LOOKUP8efb7c51-ca3f-465e-9aed-152eb36ecf0b",
				"values": {
					"layout": {
						"colSpan": 24,
						"rowSpan": 1,
						"column": 0,
						"row": 3,
						"layoutName": "ProfileContainer"
					},
					"bindTo": "NsResponsible",
					"enabled": true,
					"contentType": 3
				},
				"parentName": "ProfileContainer",
				"propertyName": "items",
				"index": 3
			},
			{
				"operation": "insert",
				"name": "STRING366b3a29-cda7-4452-94aa-4cbd6e429565",
				"values": {
					"layout": {
						"colSpan": 24,
						"rowSpan": 1,
						"column": 0,
						"row": 4,
						"layoutName": "ProfileContainer"
					},
					"bindTo": "NsComment",
					"enabled": true
				},
				"parentName": "ProfileContainer",
				"propertyName": "items",
				"index": 4
			},
			{
				"operation": "insert",
				"name": "BOOLEANd43220ab-cad4-42b2-b335-58c9d91ffb4d",
				"values": {
					"layout": {
						"colSpan": 24,
						"rowSpan": 1,
						"column": 0,
						"row": 5,
						"layoutName": "ProfileContainer"
					},
					"bindTo": "NsIsActive",
					"enabled": true
				},
				"parentName": "ProfileContainer",
				"propertyName": "items",
				"index": 5
			},
			{
				"operation": "insert",
				"name": "NotesAndFilesTab",
				"values": {
					"caption": {
						"bindTo": "Resources.Strings.NotesAndFilesTabCaption"
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
					"caption": {
						"bindTo": "Resources.Strings.NotesGroupCaption"
					},
					"items": []
				},
				"parentName": "NotesAndFilesTab",
				"propertyName": "items",
				"index": 1
			},
			{
				"operation": "insert",
				"name": "Notes",
				"values": {
					"bindTo": "Notes",
					"dataValueType": 1,
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
				"operation": "insert",
				"name": "NsSessions",
				"values": {
					"itemType": 2,
					"markerValue": "added-detail"
				},
				"parentName": "NotesAndFilesTab",
				"propertyName": "items",
				"index": 2
			},
			{
				"operation": "merge",
				"name": "ESNTab",
				"values": {
					"order": 1
				}
			}
		]/**SCHEMA_DIFF*/
	};
});
