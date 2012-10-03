using System;
using System.Collections.Concurrent;
using System.Threading;

namespace Hackathon.DataServices
{
	public class DataStore
	{
		public DataStore ()
		{
		}

		private readonly ConcurrentDictionary<string, object> _store = new ConcurrentDictionary<string, object>(StringComparer.OrdinalIgnoreCase);

		public object Read(string key)
		{
			Thread.Sleep(Config.ReadTimeInMs);
			object result = null;
			if(_store.TryGetValue(key, out result) == true )
				return result;
			else return null;
		}

		public void Write(string key, object value)
		{
			Thread.Sleep(Config.WriteTimeInMs);
			_store[key] = value;
		}

		public void Delete(string key)
		{
			Thread.Sleep(Config.DeleteTimeInMs);
			object result = null;
			_store.TryRemove(key, out result);
		}
	}


}

