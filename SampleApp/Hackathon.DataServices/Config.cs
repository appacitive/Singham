using System;
using System.Net;

namespace Hackathon.DataServices
{
    internal static class Config
    {
        public static readonly int Port = 39851;

        public static readonly IPAddress IpAddress = IPAddress.Parse("192.168.2.253");

        public static readonly bool EnableHeatmap = true;

        public static readonly int Concurrency = 3;

		public static readonly int ReadTimeInMs = 5;

		public static readonly int WriteTimeInMs = 10;

		public static readonly int DeleteTimeInMs = 15;

		public static readonly int ConnectionCreateInMs = 5;

		public static readonly int ClockBiasInMs = 5000;
    }
}

