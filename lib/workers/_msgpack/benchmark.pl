#!/usr/bin/perl -s
#
# msgpack (worker) Client for Kurunt (sending via TCP or UDP).
# NOTE: Under extreme load may cause breakage, use at own risk.
#
# /kurunt/lib/workers/msgpack
#

use IO::Socket::INET;
use Data::MessagePack;

print "--- msgpack Client for Kurunt ---\n\n";

# get command line settings: -m = number of messages, -c = cycles to run of messages, -P = port number.
# -h, help options.
if ( $h ne '' || $help ne '' ) {
	print "Use these commands to run script:\n";
	print "   -T = tcp|udp (list, optional command, transport protocol tcp or udp to Kurunt's input)\n";
	print "   -P = 6001 (number, required command, port number to Kurunt tcp or udp input port)\n";
	print "   -H = 127.0.0.1 (ip address, optional command, ip address to Kurunt tcp or udp input host)\n";
	print "   -d = data (string, optional command, data to send), will be converted to msgpack using Data::MessagePack\n";	
	print "   -m = 100 (number, required command, of messages to send)\n";
	print "   -c = 10 (number, required command, of cycles to send messages)\n\n";
	print "For example> perl benchmark.pl -T=tcp -P=6001 -m=100 -c=10 -d='hello world'\n";
	print "This example would send 100 messages every second for 10 seconds through port 6001, -H (host), -d (data) hello world.\n";
	exit(0);
}
if ( $P eq '' ) {
	die "ERROR need -T = transport protocol, -P = port number, -m = number of messages and -c = cycles, commands. For help> perl benchmark.pl -h\n";
}
if ( $m eq '' ) {
	die "ERROR need -T = transport protocol, -P = port number, -m = number of messages and -c = cycles, commands. For help> perl benchmark.pl -h\n";
}
if ( $c eq '' ) {
	die "ERROR need -T = transport protocol, -P = port number, -m = number of messages and -c = cycles, commands. For help> perl benchmark.pl -h\n";
}
my $total = $m * $c;
if ( $total == 0 ) {
	die "ERROR need -T = transport protocol, -P = port number, -m = number of messages and -c = cycles, commands. For help> perl benchmark.pl -h\n";
}



# flush after every write
$| = 1;

# tcp by default, else udp by selection.
if ( $T eq '' ) {
	$T = 'tcp';
}

# default sending messages in string format.
if ( $d eq '' ) {
	$d = 'hello world';
}

# convert message into messagepack format.
my $mp = Data::MessagePack->new();
$mp->canonical->utf8->prefer_integer if $needed;
my $packed = $mp->pack($d);

if ( $H eq '' ) {
	$H = '127.0.0.1';
}
my ($socket,$client_socket);
$socket = new IO::Socket::INET (
PeerHost => $H,
PeerPort => $P,
Proto => $T,
) or die "ERROR in Socket Creation : $!\n";

print "$T Connection Success.\n";
print "Sending $m Messages for $c Cycles, $total Total.\n";



my $i = 1;	# id sequential number.
my $cycle = 0;
for ( $cycle = 1; $cycle <= $c; $cycle++ ) {

	my $x = 1;
	for ( $x = 1; $x <= $m; $x++ ) {

		if ( $x == $m ) {
			break;
		}
		
		#print "packed: " . $packed . "\n";
		$socket->send($packed . "\n");
		
		$i++;
	}

	print "Finished sending messages for cycle " . $cycle . "\n";
	sleep (1);							# pause for one second before sending next cycle of messages.
}

print "Finished sending all cycles and messages! Good-bye.\n";

#sleep (1);								# pause for 1 second before closing connection, dont forget to - 1 second from benchmarking results!
$socket->close();

exit(0);


