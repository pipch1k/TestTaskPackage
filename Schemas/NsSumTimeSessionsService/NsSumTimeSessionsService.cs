namespace Terrasoft.Configuration.NsSumTimeSessionsServiceNamespace
{
    using System;
    using System.ServiceModel;
    using System.ServiceModel.Web;
    using System.ServiceModel.Activation;
    using Terrasoft.Core;
    using Terrasoft.Web.Common;
    using Terrasoft.Core.Entities; 
    using System.Collections.Generic;

    [ServiceContract]
    [AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Required)]
    public class NsSumTimeSessionsService : BaseService
    {
        /* Метод, возвращающий идентификатор контакта по имени контакта. */
        [OperationContract]
        [WebInvoke(
			Method = "POST", 
			RequestFormat = WebMessageFormat.Json, 
			BodyStyle = WebMessageBodyStyle.Wrapped,
            ResponseFormat = WebMessageFormat.Json
		)]
        public string GetSumTimeSessions(string NsCode)
        {
            var result = "";
            // Проверка входного параметра
            NsCode = NsCode ?? "unknown code";

            // Создание запроса для получения Id по NsCode из таблицы NsMedicalPrograms1Section
            var esqPrograms = new EntitySchemaQuery(UserConnection.EntitySchemaManager, "NsMedicalPrograms1Section");
            var colId = esqPrograms.AddColumn("Id");
            var colNsCode = esqPrograms.AddColumn("NsCode");
            var esqFilter = esqPrograms.CreateFilterWithParameters(FilterComparisonType.Equal, "NsCode", NsCode);
            esqPrograms.Filters.Add(esqFilter);

            //  Выполнение запроса к базе данных
            var programEntities = esqPrograms.GetEntityCollection(UserConnection);
			// Проверка, что есть строки в лечебной программе, с запрашиваемым кодом
            if (programEntities.Count <= 0)
            {
                return "-1"; // Если не найдено программ, возвращаем -1
            }
			// Получение значения колонки Id
            var colIdres = programEntities[0].GetColumnValue(colId.Name).ToString();
            
			// Создание запроса для получения Id по NsSessionTime из таблицы NsSessions
            var esq = new EntitySchemaQuery(UserConnection.EntitySchemaManager, "NsSessions");
            var colNsSessionTime = esq.AddColumn("NsSessionTime");
            var colStatus = esq.AddColumn("NsSessionStatus");
			// Добавление нового фильтра по Id сеанса
            var esqFilter1 = esq.CreateFilterWithParameters(FilterComparisonType.Equal, "NsMedicalPrograms1Section.Id", colIdres);
            esq.Filters.Add(esqFilter1);
			// Добавление нового фильтра по статусу сеанса
            var esqFilter2 = esq.CreateFilterWithParameters(FilterComparisonType.Equal, "NsSessionStatus.Name", "Запланирован");
            esq.Filters.Add(esqFilter2);
            //  Выполнение запроса к базе данных
            var entities = esq.GetEntityCollection(UserConnection);
			// Проверка, что есть строки сеанса, с запрашиваемым кодом
            if (entities.Count <= 0)
            {
                return "0"; // Если не найдено сеансов, возвращаем 0
            }

            // Суммируем значения времени сеансов
            int totalSessionTime = 0;

            foreach (var entity in entities)
            {
                // Получаем значение времени сеанса и добавляем к общей сумме
                var time = entity.GetColumnValue(colNsSessionTime.Name);
                totalSessionTime += (int)time;
            }

            // Возвращаем сумму времени сеансов как строку
            return totalSessionTime.ToString();
        }
    }
}
