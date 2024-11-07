namespace Terrasoft.Configuration
{
    using System;
    using System.CodeDom.Compiler;
    using System.Collections.Generic;
    using System.Data;
    using System.Linq;
    using System.Runtime.Serialization;
    using System.ServiceModel;
    using System.ServiceModel.Web;
    using System.ServiceModel.Activation;
    using System.Text;
    using System.Text.RegularExpressions;
    using System.Web;
    using Terrasoft.Common;
    using Terrasoft.Core;
    using Terrasoft.Core.DB;
    using Terrasoft.Core.Entities;
    using Terrasoft.Core.Packages;
    using Terrasoft.Core.Factories;
	
	/* Атрибут с именем макроса [MonthConversion]. */
    [ExpressionConverterAttribute("MonthConversion")]
    /* Класс реализует интерфейс IExpressionConverter. */
	class MonthConversionConverter : IExpressionConverter
    {
		public string Evaluate(object value, string arguments = "")
		{
    	try
        {
            // Преобразование объекта value (наша дата) в строку
            string date = value as string;
            DateTime ourDate;
            if (DateTime.TryParse(date, out ourDate)) //преобразуем строку в формат дата
            {
                // Названия месяцев в предложном падеже
                string[] months = {
                    "Январе", "Феврале", "Марте", "Апреле", "Мае", "Июне", 
                    "Июле", "Августе", "Сентябре", "Октябре", "Ноябре", "Декабре"
                };
                return months[ourDate.Month - 1];
            }
            else
            {
                return "Некорректная дата";
            }
        }
		catch (Exception err)
        {
        	throw err;
        }
  		}
	}
}