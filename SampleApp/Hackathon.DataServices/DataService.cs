using System;
using System.Web;
using System.Collections.Concurrent;

namespace Hackathon.DataServices
{
	public class DataService : IHttpHandler
	{

		public static Random IdGenerator = new Random(100);

		public virtual bool IsReusable
		{
			get
			{
				return false;
			}
		}
		
		public virtual void ProcessRequest(HttpContext context)
		{
			using( var scope = new SinghamScope("dataService.call") )
			{
				var operation = context.Request.Params["operation"];
				if( operation.Equals("read", StringComparison.OrdinalIgnoreCase) == true )
					ExecuteRead(context);
				else if( operation.Equals("write", StringComparison.OrdinalIgnoreCase) == true )
					ExecuteWrite(context);
				else if( operation.Equals("delete", StringComparison.OrdinalIgnoreCase) == true )
					ExecuteDelete(context);
			}
		}


		private void ExecuteRead (HttpContext context)
		{
			using( var scope = new SinghamScope("dataService.read"))
			{
				using (var conn = Global.Db.CreateConnection()) 
				{
					var id = IdGenerator.Next(1000);
					var value = conn.Read(id.ToString());
					context.Response.Write("Value: " + ( value == null ? "NULL" : value.ToString()) );
				}
			}
		}

		private void ExecuteWrite (HttpContext context)
		{
			using (var scope = new SinghamScope("dataService.write")) 
			{
				var key = IdGenerator.Next (1000);
				using (var conn = Global.Db.CreateConnection()) {
					conn.Write (key.ToString (), key.ToString ());
				}
				context.Response.Write ("Written to db.");
			}
		}


		private void ExecuteDelete (HttpContext context)
		{
			using (var scope = new SinghamScope("dataService.delete")) 
			{
				var key = IdGenerator.Next (1000);
				using (var conn = Global.Db.CreateConnection()) {
					conn.Delete (key.ToString ());
				}
				context.Response.Write ("Deleted from db.");
			}
		}

	}
}

