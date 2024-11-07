namespace Terrasoft.Configuration.NsContactEventsNamespace
{
    using System;
    using Terrasoft.Core;
    using Terrasoft.Core.Entities;
    using Terrasoft.Core.Entities.Events;

    public class ContactEvents : BaseEntityEventListener
    {
        public override void OnInserted(object sender, EntityAfterEventArgs e)
        {
            base.OnInserted(sender, e);
            var entity = (Entity)sender;
            var userConnection = entity.UserConnection;

            // Получаем ID текущего пользователя
            var currentUserId = userConnection.CurrentUser.Id;

            // Запрос для получения контакта текущего пользователя
            var esqContact = new EntitySchemaQuery(userConnection.EntitySchemaManager, "Contact");
            esqContact.AddColumn("Id");
            esqContact.AddColumn("RegionId");

            // Фильтр для получения контакта по SysAdminUnitId
            var esqFilter = esqContact.CreateFilterWithParameters(FilterComparisonType.Equal, "Id", currentUserId);
            esqContact.Filters.Add(esqFilter);

            var contactEntities = esqContact.GetEntityCollection(userConnection);
            if (contactEntities.Count == 0)
            {
                return; // Если контакт не найден
			}
            var contact = contactEntities[0];
            var regionId = contact.GetTypedColumnValue<Guid>("RegionId");

            // Запрос для получения региона по regionId
            var esqRegion = new EntitySchemaQuery(userConnection.EntitySchemaManager, "Region");
            esqRegion.AddColumn("RefOrgRoleId");

            // Фильтр для получения региона по Id
            var esqFilterRegion = esqRegion.CreateFilterWithParameters(FilterComparisonType.Equal, "Id", regionId);
            esqRegion.Filters.Add(esqFilterRegion);

            var regionEntities = esqRegion.GetEntityCollection(userConnection);
            if (regionEntities.Count == 0)
            {
                return;
            }

            var region = regionEntities[0];
            var regOrgRole = region.GetTypedColumnValue<string>("RefOrgRoleId");
			// Преобразование строки в Guid для сравнения
            Guid specificRegionId = Guid.Parse("C0397971-813F-48E2-A37F-6AE702E4EDC5");
			
            // Установка прав доступа на основе роли региона
            if ((regOrgRole == "Отдел продаж. Казань") && (regionId==specificRegionId))
            {
                entity.SetColumnValue("Operation", 0); // чтение
                entity.SetColumnValue("RightLevel", 1); // разрешено
            }
            else
            {
                entity.SetColumnValue("Operation", 0); // чтение
                entity.SetColumnValue("RightLevel", 0); // запрещено
            }
        }
    }
}
