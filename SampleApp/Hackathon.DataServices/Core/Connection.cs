using System;

namespace Hackathon.DataServices
{
	public class Connection : IDisposable
	{
		public Connection (Database database, int sessionId)
		{
			this.Db = database;
			this.SessionId = sessionId;
		}

		public Database Db { get; private set; }

		public int SessionId {get; private set;}

		public object Read(string key)
		{
			using (var scope = new SinghamScope("dataService.connection.read"))
			{
				return this.Db.Store.Read(key);
			}
		}

		public void Delete(string key)
		{
			using (var scope = new SinghamScope("dataService.connection.delete"))
			{
				this.Db.Store.Delete(key);
			}
		}

		public void Write(string key, object value)
		{
			using (var scope = new SinghamScope("dataService.connection.write"))
			{
				this.Db.Store.Write(key, value);
			}
		}


		#region IDisposable implementation
		public void Dispose ()
		{
			this.Db.ReleaseSession(this.SessionId);
		}
		#endregion

	}
}

