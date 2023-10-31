#ifndef EMULATIONSTATION_ALL_SYSTEMCONF_H
#define EMULATIONSTATION_ALL_SYSTEMCONF_H


#include <string>
#include <map>
#include <set>
#include <vector>
#include <rapidjson/rapidjson.h>

class SystemConfSub
{
friend class SystemConf;
friend class SystemConfAddress;

public:
	virtual ~SystemConfSub();
	SystemConfSub(const std::string& dir);

	void load();
	void save(std::vector<std::string>& fileLines, const std::string& level, const std::string& removeID);

private:
	bool mIsRoot;
	bool mWasLoaded;
	bool mWasChanged;
	bool mSeparated;
	std::string mSaveDir;
	std::map<std::string,SystemConfSub*> mSub;
	std::map<std::string,std::string> mCfg;
	std::set<std::string> mDontRemove;

	SystemConfSub(const SystemConfSub* parent,const std::string& name);
	void init();
	void clear();
	void updateConf(std::vector<std::string>& fileLines, const std::string& level, const std::string& removeID);
};

class SystemConfPeriod
{
public:
	bool done;
	std::string prefix;
	std::string suffix;

	SystemConfPeriod(const std::string &name);
};

class SystemConfAddress
{
public:
	SystemConfSub* target;
	std::string key;

	inline SystemConfAddress(SystemConfSub* t,const std::string& k){
		target=t;
		key=k;
	}

	bool exists();
	bool wasChanged();
	bool isDontRemove();
	const std::string& getCfg();

	void setDontRemove(bool side);
	void setSeparate(bool side);
	bool removeCfg();
	bool setCfg(const std::string &val);
};

class SystemConf 
{
friend class SystemConfSub;
friend class SystemConfAddress;

public:
	virtual ~SystemConf();
	static SystemConf* getInstance();
	
	static bool getIncrementalSaveStates();
	static bool getIncrementalSaveStatesUseCurrentSlot();

    bool loadSystemConf();
    bool saveSystemConf();

    std::string get(const std::string &name);
    bool set(const std::string &name, const std::string &value);

	bool getBool(const std::string &name, bool defaultValue = false);
	bool setBool(const std::string &name, bool value);

	SystemConfAddress peekSub(const SystemConfSub* target, const std::string &name) const;
	SystemConfAddress diggSub(SystemConfSub* target, const std::string &name);

	inline bool wasChanged(const std::string &name) const{
		return peekSub(mpRoot,name).wasChanged();
	}
	inline bool isDontRemove(const std::string &name) const{
		return peekSub(mpRoot,name).isDontRemove();
	}

	inline bool exists(const std::string &name){
		return diggSub(mpRoot,name).exists();
	}
	inline const std::string& getCfg(const std::string &name){
		return diggSub(mpRoot,name).getCfg();
	}

	inline void setDontRemove(const std::string &name,bool side){
		if(side)diggSub(mpRoot,name).setDontRemove(side);
		else peekSub(mpRoot,name).setDontRemove(side);
	}
	inline void setSeparate(const std::string &name,bool side){
		if(side)diggSub(mpRoot,name).setSeparate(side);
		else peekSub(mpRoot,name).setSeparate(side);
	}
	inline bool removeCfg(const std::string &name){
		return diggSub(mpRoot,name).removeCfg();
	}
	inline bool setCfg(const std::string &name, const std::string &val){
		return diggSub(mpRoot,name).setCfg(val);
	}

private:
	SystemConf();
	static SystemConf* sInstance;

	std::map<std::string, std::string> confMap;
	bool mWasChanged;

	std::string mSystemConfFile;
	std::string mSystemConfFileTmp;

	SystemConfSub* mpRoot;
};


#endif //EMULATIONSTATION_ALL_SYSTEMCONF_H
