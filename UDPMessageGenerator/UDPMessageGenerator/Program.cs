using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;

namespace UDPMessageGenerator
{
    class Program
    {
        static UdpClient udpClient = new UdpClient(39851);
        static bool flag = true;
        static void Main(string[] args)
        {
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
            var ip = IPAddress.Parse("192.168.3.11");
            udpClient.Connect(ip, 39851);
 
         Byte[] sendBytes = Encoding.ASCII.GetBytes(string.Format("{0}|{1}", api, timeTaken));
 
         udpClient.Send(sendBytes, sendBytes.Length);
        }

        public static bool  ReturnAlternateBool()
        {
            flag = flag != true;
            return flag;
        }
    }

}
