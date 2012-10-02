using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;

namespace UDPMessageGeneratorMono
{
    class Program
    {
        static UdpClient udpClient = new UdpClient(39851);
		static IPAddress ip = IPAddress.Parse("192.168.3.11");
        static bool flag = true;
		
        static void Main(string[] args)
        {
			udpClient.Connect(ip, 39851);
            List<string> apiCalls = new List<string>() { "articleservice", "schemaservice", "connectionservice", "relationservice", "searchservice","blueprintservice","accountservice" };
            Random random = new Random();
            
            while (true)
            {
                var randomInt = random.Next(1, 100);
                
                for (int i = 0; i < randomInt; i++)
                {
                    var randomApi = random.Next(0, 6);
                    long latency = ReturnAlternateBool()
                                       ? (randomInt*10) + random.Next(0, 100)
                                       : (randomInt*10) - random.Next(0, 100);
                    SendUDP( apiCalls[randomApi], latency);
                    var rnd = randomInt / 100;
                    Thread.Sleep((1 - rnd) * 100);
                }
            }
        }
       

        public static void SendUDP(string api, long timeTaken)
        {
            Console.WriteLine(string.Format("{0}|{1} at {2}", api, timeTaken, DateTime.Now.Ticks));
            
 
         Byte[] sendBytes = Encoding.ASCII.GetBytes(string.Format("{0}|{1}|{2}", api, timeTaken, DateTimeToUnixTimestamp()));
 
         udpClient.Send(sendBytes, sendBytes.Length);
        }

        public static bool  ReturnAlternateBool()
        {
            flag = flag != true;
            return flag;
        }
		
		public static double DateTimeToUnixTimestamp ()
{
    return (DateTime.UtcNow - new DateTime (1970, 1, 1).ToLocalTime()).TotalSeconds;
}
    }

}
