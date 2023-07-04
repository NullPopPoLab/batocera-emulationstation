#pragma once

#include <string>
#include <map>
#include "utils/TimeUtil.h"

class FileData;
class SaveStateRepository;

struct SaveState
{
	SaveState(SaveStateRepository* repo=nullptr)
	{
		mRepository=repo;
		slot = -99;
	}

	SaveState(int slotId)
	{
		slot = slotId;
	}
	
	bool isSlotValid() const { return slot != -99; }
	
	std::string rom;
	std::string fileName;
	std::string getScreenShot() const;
	bool hasMeta() const;
	std::string getMetaPath() const;
	bool getMetaContent(std::map<std::string,std::string>& dst) const;
	int slot;

	void remove() const;
	bool copyToSlot(int slot, bool move = false) const;

	Utils::Time::DateTime creationDate;

public:
	virtual std::string makeStateFilename(int slot, bool fullPath = true) const;

	std::string setupSaveState(FileData* game, const std::string& command);
	void onGameEnded(FileData* game);

private:
	SaveStateRepository* mRepository;
	std::string mAutoFileBackup;
	std::string mAutoImageBackup;
	std::string mAutoMetaBackup;


	std::string mNewSlotFile;	
	std::string mNewSlotCheckSum;
};
