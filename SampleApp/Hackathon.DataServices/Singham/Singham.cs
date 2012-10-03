using System;
using System.Net.Sockets;
using System.Text;

namespace Hackathon.DataServices
{
    public class Singham
    {
        public void Roar(string statName, long timestamp, long timeTaken )
        {
            SendStats(statName, timestamp, timeTaken);
        }

		private void SendStats(string name, long timestamp, long timeTaken)
        {
            try
            {
                using( var client = new UdpClient() )
				{
	                client.Connect(Config.IpAddress, Config.Port);
	                var sendBytes = Encoding.ASCII.GetBytes(string.Format("{0}|{1}|{2}", name, timeTaken, timestamp));
	                client.Send(sendBytes, sendBytes.Length);
				}
            } 
            catch
            {
                // Suppress exception.
            }
        }

        private void SendStatsAsync(string name, long timestamp, long timeTaken)
        {
            try
            {
                var client = new UdpClient();
                client.Connect(Config.IpAddress, Config.Port);
                var sendBytes = Encoding.ASCII.GetBytes(string.Format("{0}|{1}|{2}", name, timeTaken, timestamp));
                client.BeginSend(sendBytes, sendBytes.Length, OnSend, client);
            } 
            catch
            {
                // Suppress exception.
            }
        }

        private void OnSend(IAsyncResult ar)
        {
            var client = ar.AsyncState as UdpClient;
            if( client == null ) return;
            try 
            {
                client.EndSend(ar);
				client.Close();
            }
            catch 
            { 
                // Suppress exception.
            }
        }

    }
}

