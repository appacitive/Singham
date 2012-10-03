using System;
using System.Diagnostics;
using System.Net.Sockets;
using System.Net;
using System.Text;

namespace Hackathon.DataServices
{
	public class SinghamScope : IDisposable
	{
		public SinghamScope (string name)
		{
			this.Name = name;
		}

		private DateTime _timestamp = DateTime.UtcNow;
		public string Name { get; set;}
		private Stopwatch _timer = Stopwatch.StartNew();
		private bool _isDisposed = false;

		#region IDisposable implementation
		public void Dispose ()
		{
			if (_isDisposed == false) 
			{
				var ticks = (decimal)_timer.ElapsedTicks;
				var resolution = (decimal)Stopwatch.Frequency;
				_timer.Stop ();
				_timer = null;
				_isDisposed = true;
				var timeTaken = ( ticks / resolution ) * 1000.0m;
				var singham = new Singham();
				singham.Roar(this.Name, ToUnixTime(_timestamp), (long)timeTaken);
			}
		}
		#endregion

		private long ToUnixTime(DateTime date)
		{
			return Convert.ToInt64((date - new DateTime (1970, 1, 1, 0, 0, 0, DateTimeKind.Utc)).TotalMilliseconds) - Config.ClockBiasInMs;
		}



	}
}

