prefix  = 'http://datacache.org/dc/sync?source=http://datacache.org/dc/demo/';
files   = {'file1.txt','file2.txt'};

dclocal = ''; 
%dclocal = '/usr/local/datacache/cache';

Ng        = 1.0; % Size of RAM disk in GB.
ramdisk   = false;
keepfiles = true; % Usually set to false if ramdisk=true because ramdisk is deleted on boot.

if (ramdisk && keepfiles)
	war = 'Files will be lost when script is re-run, ramdisk is unmounted, or system is rebooted.';
	war = sprintf('%s Set ramdisk = false to save data to disk.',war);
	warning(war);
end

[stat,path] = system('which curl');
if (stat == 0)
	curl = true;
end

if (length(strmatch(prefix(1:16),'http://localhost','exact')) > 0)
	if (length(dclocal) == 0)		
		sprintf('It looks like you are accessing data from a local install of DataCache\n');
		sprintf('To speed up data reads, edit the variable named dcloal to point to the\n')
		sprintf('DataCache cache directory\n');
	end
end

outdir = '';
if (ramdisk)
	% TODO: If RAM disk is as fast as main disk, don't create RAM disk
	% (because main disk is probably solid state). 
	if exist('/usr/sbin/diskutil') && ~exist('/Volumes/ramdisk') % OS X
		Nb = floor(Ng*1024^3/512);
		com = sprintf('diskutil erasevolume HFS+ "ramdisk" `hdiutil attach -nomount ram://%d`,Nb);
		outdir  = '/Volumes/ramdisk/';
	else if exist('/usr/sbin/diskutil') && ~exist('/tmp/ramdisk') % Linux
		com = sprintf('mkfs -q /dev/ram1 %d; mkdir -p /tmp/ramdisk; mount /dev/ram1 /ramcache,Ng);
		outdir  = '/tmp/ramdisk/';
	else
		sprintf('Cannot create RAM disk.');
		ramdisk = false;
	end
	delete('/Volumes/ramdisk/*');	
end

% Reliable but slow.
if (forceslow) || (ramdisk == false) || (curl == false)
	D = [];
	for i=1:length(files)
		sprintf('Reading %4d/%4d',i,length(files));
		% URLREAD can only return data as a string.
		if (keepfiles)
			s = urlread([prefix,files{i}]);
			sprintf('Saving %4d/%4d',i,length(files));
			fid = fopen(files{i},'w');fprintf(fid,s);fclose(fid);
			d = str2double(s);
		else	
			d = str2double(urlread([prefix,urls{i}]));
		else 	  
		D = [D;d];
	end
end

% Fast but requires CuRL.
if (curl == true)
	% Spawn parallel downloads
	for i=1:length(files)
		if (i>1),amp='&';,else amp='';,end;
		curlstr = curlstr + sprintf('%s curl %s > %s',amp,[prefix,files{i}],[outdir,files{i}]); 
	end
	[status,result] = system(curlstr);	
	
	D = [];
	for i=1:length(files)
		sprintf('Reading and saving %4d/%4d',i,length(files));
		urlwrite([prefix,files{i}],[outdir,files{i}]);
		if getfield(dir([outdir,files{i}]),'bytes') + (prod(getfield(whos(D),'bytes')) >= Ng*1e9)
			warning('Aborting because next read will exceed available RAM disk space.');
			break;
		end	
		d = load([outdir,files{i}]);
		if (keepfiles == false), delete([outdir,files{i}]);end	
		D = [D;d];
	end
end
