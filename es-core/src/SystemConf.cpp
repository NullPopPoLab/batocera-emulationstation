#include "SystemConf.h"
#include <iostream>
#include <fstream>
#include "Log.h"
#include "utils/StringUtil.h"
#include "utils/FileSystemUtil.h"
#include "Settings.h"
#include "Paths.h"

#include <set>
#include <regex>
#include <string>
#include <iostream>
#include <SDL_timer.h>

#include <rapidjson/rapidjson.h>
#include <rapidjson/document.h>
#include <rapidjson/prettywriter.h>
#include <rapidjson/stringbuffer.h>

static std::string sEmpty="";

static std::string mapSettingsName(const std::string& name)
{
	if (name == "system.language")
		return "Language";

	return name;
}

SystemConf *SystemConf::sInstance = NULL;

static std::set<std::string> dontRemoveValue
{
	{ "audio.device" }
};

static std::map<std::string, std::string> defaults =
{
	{ "kodi.enabled", "1" },
	{ "kodi.atstartup", "0" },
	{ "audio.bgmusic", "1" },
	{ "wifi.enabled", "0" },
	{ "system.hostname", "BATOCERA" }, // batocera
	{ "global.retroachievements", "0" },
	{ "global.retroachievements.hardcore", "0" },
	{ "global.retroachievements.leaderboards", "0" },
	{ "global.retroachievements.verbose", "0" },
	{ "global.retroachievements.screenshot", "0" },
	{ "global.retroachievements.username", "" },
	{ "global.retroachievements.password", "" },
	{ "global.netplay_public_announce", "1" },
	{ "global.ai_service_enabled", "0" },
};

SystemConf::SystemConf() 
{
	mpRoot = new SystemConfSub(Paths::getSavesPath());
	for(auto& s: dontRemoveValue){
		setDontRemove(s,true);

		if(!isDontRemove(s)){
			LOG(LogError) << "ought to set dontRemove " << s;
		}
	}
	for(auto& u: defaults){
		setCfg(u.first,u.second);

		auto& s=getCfg(u.first);
		if(s!=u.second){
			LOG(LogError) << "ought to set u.first="<<u.second<<" but be " << s;
		}
	}

	mSystemConfFile = Paths::getSystemConfFilePath();
	if (mSystemConfFile.empty())
		return;
	
	mSystemConfFileTmp = mSystemConfFile + ".tmp";
	loadSystemConf();	
}

SystemConf *SystemConf::getInstance() 
{
    if (sInstance == NULL)
        sInstance = new SystemConf();

    return sInstance;
}

bool SystemConf::loadSystemConf()
{
	if (mSystemConfFile.empty())
		return true;

	mWasChanged = false;

	std::string line;
	std::ifstream systemConf(mSystemConfFile);
	if (systemConf && systemConf.is_open()) 
	{
		while (std::getline(systemConf, line)) 
		{

			int idx = line.find("=");
			if (idx == std::string::npos || line.find("#") == 0 || line.find(";") == 0)
				continue;

			std::string key = line.substr(0, idx);
			std::string value = line.substr(idx + 1);
			if (!key.empty()){
				if(value.empty())removeCfg(key);
				else setCfg(key,value);
			}
		}
		systemConf.close();
	}
	else
	{
		LOG(LogError) << "Unable to open " << mSystemConfFile;
		return false;
	}

	return true;
}

bool SystemConf::saveSystemConf()
{
	if (mSystemConfFile.empty())
		return Settings::getInstance()->saveFile();	

	if (!mWasChanged)
		return false;

	std::ifstream filein(mSystemConfFile); //File to read from

#ifndef WIN32
	if (!filein)
	{
		LOG(LogError) << "Unable to open for saving :  " << mSystemConfFile << "\n";
		return false;
	}
#endif

	/* Read all lines in a vector */
	std::vector<std::string> fileLines;
	std::string line;

	if (filein)
	{
		while (std::getline(filein, line))
			fileLines.push_back(line);

		filein.close();
	}

	static std::string removeID = "$^Ep$^mpv$êrpver$^vper$vper$^vper$vper$vper$^vperv^pervncvizn";

	int lastTime = SDL_GetTicks();
	mpRoot->save(fileLines,"",removeID);

	lastTime = SDL_GetTicks() - lastTime;

	LOG(LogDebug) << "saveSystemConf :  " << lastTime;

	std::ofstream fileout(mSystemConfFileTmp); //Temporary file
	if (!fileout)
	{
		LOG(LogError) << "Unable to open for saving :  " << mSystemConfFileTmp << "\n";
		return false;
	}
	for (int i = 0; i < fileLines.size(); i++) 
	{
		if (fileLines[i] != removeID)
			fileout << fileLines[i] << "\n";
	}

	fileout.close();
	
	std::ifstream  src(mSystemConfFileTmp, std::ios::binary);
	std::ofstream  dst(mSystemConfFile, std::ios::binary);
	dst << src.rdbuf();

	remove(mSystemConfFileTmp.c_str());
	mWasChanged = false;

	return true;
}

std::string SystemConf::get(const std::string &name) 
{
	if (mSystemConfFile.empty())
		return Settings::getInstance()->getString(mapSettingsName(name));
	
	if(!mpRoot)return "";
	return getCfg(name);

}

bool SystemConf::set(const std::string &name, const std::string &value) 
{
	if (mSystemConfFile.empty())
		return Settings::getInstance()->setString(mapSettingsName(name), value == "auto" ? "" : value);

	if(!mpRoot)return false;
	if(setCfg(name,value))mWasChanged = true;

	return false;
}

bool SystemConf::getBool(const std::string &name, bool defaultValue)
{
	if (mSystemConfFile.empty())
		return Settings::getInstance()->getBool(mapSettingsName(name));

	if (defaultValue)
		return get(name) != "0";

	return get(name) == "1";
}

bool SystemConf::setBool(const std::string &name, bool value)
{
	if (mSystemConfFile.empty())
		return Settings::getInstance()->setBool(mapSettingsName(name), value);

	return set(name, value  ? "1" : "0");
}

bool SystemConf::getIncrementalSaveStates()
{
	auto valGSS = SystemConf::getInstance()->get("global.incrementalsavestates");
	return valGSS != "0" && valGSS != "2";
}

bool SystemConf::getIncrementalSaveStatesUseCurrentSlot()
{
	return SystemConf::getInstance()->get("global.incrementalsavestates") == "2";
}

SystemConf::~SystemConf()
{
	if(mpRoot){
		delete mpRoot;
		mpRoot=nullptr;
	}
}

SystemConfSub::~SystemConfSub()
{
	clear();
}

SystemConfSub::SystemConfSub(const std::string& dir)
{
	mIsRoot=true;
	mSeparated=false;
	mSaveDir=dir;
	init();
}

SystemConfSub::SystemConfSub(const SystemConfSub* parent,const std::string& name)
{
	mIsRoot=false;
	mSeparated=parent->mSeparated;
	mSaveDir=parent->mSaveDir+'/'+name;
	init();
}

void SystemConfSub::init(){

	mWasLoaded=false;
	mWasChanged=false;
}

void SystemConfSub::clear(){

	for(auto& u: mSub){
		delete u.second;
	}
	mSub.clear();
}

SystemConfPeriod::SystemConfPeriod(const std::string &name)
{
	done=false;
	prefix="";
	suffix=name;

	if(suffix[0]=='['){
		if(suffix[1]=='"'){
			suffix=suffix.substr(2);

			auto qp=suffix.find('"');
			if(qp==std::string::npos){
				prefix=suffix;
				suffix="";
				return;
			}

			prefix=suffix.substr(0,qp);
			suffix=suffix.substr(qp+1);
		}
		else{
			suffix=suffix.substr(1);
		}

		auto ep=suffix.find(']');
		if(ep==std::string::npos){
			prefix+=suffix;
			suffix="";
			return;
		}

		prefix+=suffix.substr(0,ep);
		suffix=suffix.substr(ep+1);
	}

	auto dp=suffix.find('.');
	auto bp=suffix.find('[');
	if(dp==std::string::npos && bp==std::string::npos){
		prefix+=suffix;
		suffix="";
		return;
	}

	if(dp<bp){
		prefix+=suffix.substr(0,dp);
		suffix=suffix.substr(dp+1);
	}
	else{
		prefix+=suffix.substr(0,bp);
		suffix=suffix.substr(bp);
	}
	done=true;
}

SystemConfAddress SystemConf::peekSub(const SystemConfSub* target, const std::string &name) const
{
	SystemConfPeriod sp(name);
	if(!sp.done || !target){
		return SystemConfAddress(const_cast<SystemConfSub*>(target),sp.prefix);
	}

	auto it = target->mSub.find(sp.prefix);
	if (it == target->mSub.cend()) {
		return SystemConfAddress(nullptr,sp.suffix);
	}
	return peekSub(it->second,sp.suffix);
}

SystemConfAddress SystemConf::diggSub(SystemConfSub* target, const std::string &name)
{
	SystemConfPeriod sp(name);
	if(!sp.done || !target){
		return SystemConfAddress(target,sp.prefix);
	}

	auto it = target->mSub.find(sp.prefix);
	if (it == target->mSub.cend()) {
		auto* p=new SystemConfSub(target,sp.prefix);
		target->mSub[sp.prefix]=p;
		return diggSub(p,sp.suffix);
	}
	return diggSub(it->second,sp.suffix);
}

bool SystemConfAddress::wasChanged()
{
	if(!target)return false;
	return target->mWasChanged;
}

bool SystemConfAddress::isDontRemove()
{
	if(!target)return false;
	auto it = target->mDontRemove.find(key);
	return it != target->mDontRemove.cend();
}

bool SystemConfAddress::exists()
{
	if(!target)return false;
	if(!target->mWasLoaded)target->load();

	auto it=target->mCfg.find(key);
	return it!=target->mCfg.cend();
}

const std::string& SystemConfAddress::getCfg()
{
	if(!target){
		return sEmpty;
	}

	if(!target->mWasLoaded)target->load();

	auto it = target->mCfg.find(key);
	if(it==target->mCfg.cend()){
		return sEmpty;
	}
	return it->second;
}

void SystemConfAddress::setDontRemove(bool side)
{
	if(!target){
		LOG(LogError) << "SystemConfSub.setDontRemove: (null): " << key;
		return;
	}

	auto it = target->mDontRemove.find(key);
	if(it==target->mDontRemove.cend()){
		if(side)target->mDontRemove.insert(key);
	}
	else{
		if(!side)target->mDontRemove.erase(it);
	}
}

void SystemConfAddress::setSeparate(bool side)
{
	if(!target){
		LOG(LogError) << "SystemConfSub.setSeparate: (null): " << key;
		return;
	}

	target->mSeparated=side;
}

bool SystemConfAddress::removeCfg()
{
	if(!target){
		LOG(LogError) << "SystemConfSub.removeCfg: (null): " << key;
		return false;
	}

	if(!target->mWasLoaded)target->load();

	auto r=false;
	auto it = target->mSub.find(key);
	if (it == target->mSub.cend()){
	}
	else{
		target->mSub.erase(it);
		target->mWasChanged=true;
		r=true;
	}
	return r;
}

bool SystemConfAddress::setCfg(const std::string &val)
{
	if(!target){
		LOG(LogError) << "SystemConfSub.setCfg: (null): " << key << "=" << val;
		return false;
	}

	if(!target->mWasLoaded)target->load();

	target->mCfg[key]=val;
	target->mWasChanged=true;
	return true;
}

void SystemConfSub::updateConf(std::vector<std::string>& fileLines, const std::string& level, const std::string& removeID)
{
	for(auto it: mCfg){
		std::string key = level+'.'+it.first + "=";		
		char key0 = key[0];
		bool lineFound = false;

		for (auto& currentLine : fileLines)
		{
			if (currentLine.size() < 3)
				continue;

			char fc = currentLine[0];
			if (fc != key0 && currentLine[1] != key0)
				continue;

			int idx = currentLine.find(key);
			if (idx == std::string::npos)
				continue;

			if (idx == 0 || (idx == 1 && (fc == ';' || fc == '#')))
			{
				std::string val = it.second;
				if ((!val.empty() && val != "auto") || SystemConfAddress(this,it.first).isDontRemove())
				{
					auto defaultValue = defaults.find(key);
					if (defaultValue != defaults.cend() && defaultValue->second == val)
						currentLine = removeID;
					else
						currentLine = key + val;
				}
				else 
					currentLine = removeID;

				lineFound = true;
			}
		}

		if (!lineFound)
		{
			std::string val = it.second;
			if (!val.empty() && val != "auto")
				fileLines.push_back(key + val);
		}
	}
}

void SystemConfSub::load(){

	if(!mSeparated)return;

	LOG(LogDebug) << "SystemConfSub.load: " << mSaveDir;

	auto path=mSaveDir+"/conf.json";
	if(Utils::FileSystem::exists(path)){
		std::ifstream file(path);
		if (!file.is_open()) {
			LOG(LogError) << "cannot open: " << path;
		}
		else{
			std::string json;
			json=std::string(std::istreambuf_iterator<char>(file),std::istreambuf_iterator<char>());
			file.close();

			rapidjson::Document doc;
			doc.Parse(json.c_str());
			if (doc.HasParseError()){
				LOG(LogError) << "invalid JSON: " << path;
			}
			else for (auto it = doc.MemberBegin(); it != doc.MemberEnd(); ++it){
				auto k=it->name.GetString();
				auto v=it->value.GetString();
				if(!k || !v)continue;
				mCfg[k]=v;
			}
		}
	}

	mWasLoaded=true;
}

void SystemConfSub::save(std::vector<std::string>& fileLines, const std::string& level, const std::string& removeID)
{
	LOG(LogDebug) << "SystemConfSub.save: " << mSaveDir;

	if(!mWasChanged){}
	else if(mSeparated){
		rapidjson::StringBuffer sb;
		rapidjson::PrettyWriter<rapidjson::StringBuffer> writer(sb);
		writer.StartObject();
		for(auto it: mCfg){
			writer.Key(it.first.c_str()); writer.String(it.second.c_str());
		}
		writer.Key("[End]"); writer.Null();
		writer.EndObject();

		auto path=mSaveDir+"/conf.json";
		std::ofstream file(path.c_str());
		if (!file.is_open()) {
			LOG(LogError) << "cannot open: " << path;
		}
		else{
			file<<sb.GetString();
			file.close();
		}
		mWasChanged=false;
	}
	else{
		updateConf(fileLines,level,removeID);
		mWasChanged=false;
	}

	auto next=(level=="")?"":(level+'.');
	for(auto it: mSub){
		it.second->save(fileLines,next+it.first,removeID);
	}
}
