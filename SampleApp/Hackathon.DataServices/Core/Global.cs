using System;

namespace Hackathon.DataServices
{
	public static class Global
	{
		public static Database Db = new Database(Config.Concurrency);
	}
}

