using System;
using System.Threading;
using System.Web;

namespace Hackathon.DataServices
{
	public class Database
	{
		public Database (int concurrency)
		{
			this.Store = new DataStore();
			_concurrentSessions = new int[concurrency];
			for (int i = 0; i < _concurrentSessions.Length; i++) {
				_concurrentSessions[i] = 0;
			}
		}


		public DataStore Store { get; private set; }
		private object _syncRoot = new object();
		private int[] _concurrentSessions;
		public Connection CreateConnection ()
		{
			using (var scope = new SinghamScope("dataService.getSession")) 
			{
				int sessionId = GetSession ();
				return new Connection (this, sessionId);
			}
		}		


		private int GetSession()
		{
			int sessionId = 0;
			while( TryGetSession(out sessionId) == false )
				Thread.Sleep(100);
			return sessionId;
		}

		private bool TryGetSession (out int sessionId)
		{
			sessionId = 0;
			Thread.Sleep (Config.ConnectionCreateInMs);
			lock (_syncRoot) 
			{
				for (int i = 0; i < _concurrentSessions.Length; i++) 
				{
					if (_concurrentSessions [i] == 0) {
						_concurrentSessions [i] = Thread.CurrentThread.ManagedThreadId;
						sessionId = i + 1;
						PrintSessions ();
						return true;
					}
				}
				PrintSessions ();
				return false;	
			}

		}

		private void PrintSessions ()
		{
			HttpContext.Current.Response.Write("Sessions (threads): ");
			for (int i = 0; i < _concurrentSessions.Length; i++) 
			{
				HttpContext.Current.Response.Write(_concurrentSessions[i] + " | ");
			}
			HttpContext.Current.Response.Write(Environment.NewLine);
		}

		public void ReleaseSession(int sessionId)
		{
			lock (_syncRoot)
			{
				if (sessionId > 0)
					_concurrentSessions [sessionId - 1] = 0;
			}
		}


	}
}

