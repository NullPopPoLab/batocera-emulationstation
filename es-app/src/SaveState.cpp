#include "SaveState.h"
#include "SystemData.h"
#include "FileData.h"
#include "utils/StringUtil.h"
#include "ApiSystem.h"
#include "FileData.h"
#include "SaveStateRepository.h"
#include "SystemConf.h"
#include "Log.h"

#include <iostream>
#include <fstream>
#include <rapidjson/rapidjson.h>
#include <rapidjson/document.h>
#include <rapidjson/prettywriter.h>
#include <rapidjson/stringbuffer.h>

std::string SaveState::makeStateFilename(int slot, bool fullPath) const
{
	std::string ret = this->rom + "/state" + (slot < 0 ? ".auto" : std::to_string(slot));
	if (!fullPath) return ret;

	return Utils::FileSystem::combine(
		mRepository?mRepository->getSavesPath():
			Utils::FileSystem::getParent(fileName),
		ret);
}

std::string SaveState::getScreenShot() const
{
	if (!fileName.empty() && Utils::FileSystem::exists(fileName + ".png"))
		return fileName + ".png";

	return "";
}

bool SaveState::hasMeta() const
{
	if (fileName.empty()) return false;
	if (!Utils::FileSystem::exists(fileName + ".json")) return false;
	return true;
}

std::string SaveState::getMetaPath() const
{
	if (!hasMeta()) return "";
	return fileName + ".json";
}

bool SaveState::getMetaContent(std::map<std::string,std::string>& dst) const
{
	dst.clear();
	if (!hasMeta()) return false;

	auto path=getMetaPath();
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
			dst[k]=v;
		}
	}

	return true;
}

std::string SaveState::setupSaveState(FileData* game, const std::string& command)
{
	if (game == nullptr)
		return command;
	
	// We start games with new slots : If the users saves the game, we don't loose the previous save
	int nextSlot = SaveStateRepository::getNextFreeSlot(game);

	if (!isSlotValid() && !isLabelValid())
	{
		if (nextSlot > 0 && !SystemConf::getIncrementalSaveStatesUseCurrentSlot())
		{
			// We start a game normally but there are saved games : Start game on next free slot to avoid loosing a saved game
			return command + " -state_slot " + std::to_string(nextSlot);
		}

		return command;
	}

	bool incrementalSaveStates = SystemConf::getIncrementalSaveStates();
	
	std::string path = Utils::FileSystem::getParent(fileName);

	std::string cmd = command;
	if (slot == -1) // Run current AutoSave
		cmd = cmd + " -autosave 1 -state_slot " + std::to_string(nextSlot);
	else
	{
		if (slot == -2) // Run new game without AutoSave
		{
			cmd = cmd + " -autosave 0 -state_slot " + std::to_string(nextSlot);
		}
		else if (isLabelValid())
		{
			// Run game, and activate AutoSave to load it
			cmd = cmd + " -autosave 1";
		}
		else if (incrementalSaveStates)
		{
			cmd = cmd + " -state_slot " + std::to_string(nextSlot); // slot

			// Run game, and activate AutoSave to load it
			if (!fileName.empty())
				cmd = cmd + " -autosave 1";
		}
		else
		{
			cmd = cmd + " -state_slot " + std::to_string(slot);

			// Run game, and activate AutoSave to load it
			if (!fileName.empty())
				cmd = cmd + " -autosave 1";
		}

		// Copy to state.auto file
		auto autoFilename = makeStateFilename(-1);
		if (Utils::FileSystem::exists(autoFilename))
		{
			Utils::FileSystem::removeFile(autoFilename + ".bak");
			Utils::FileSystem::renameFile(autoFilename, autoFilename + ".bak");				
		}

		// Copy to state.auto.png file
		auto autoImage = autoFilename + ".png";
		if (Utils::FileSystem::exists(autoImage))
		{
			Utils::FileSystem::removeFile(autoImage + ".bak");
			Utils::FileSystem::renameFile(autoImage, autoImage + ".bak");				
		}

		auto autoMeta = autoFilename + ".json";
		if (Utils::FileSystem::exists(autoMeta))
		{
			Utils::FileSystem::removeFile(autoMeta + ".bak");
			Utils::FileSystem::renameFile(autoMeta, autoMeta + ".bak");				
		}

		mAutoMetaBackup = autoMeta;
		mAutoImageBackup = autoImage;
		mAutoFileBackup = autoFilename;

		if (!fileName.empty())
		{
			Utils::FileSystem::copyFile(fileName, autoFilename);

			if (incrementalSaveStates && nextSlot >= 0 && slot + 1 != nextSlot)
			{
				// Copy file to new slot, if the users want to reload the saved game in the slot directly from retroach
				mNewSlotFile = makeStateFilename(nextSlot);
				Utils::FileSystem::removeFile(mNewSlotFile);
				if (Utils::FileSystem::copyFile(fileName, mNewSlotFile))
					mNewSlotCheckSum = ApiSystem::getInstance()->getMD5(fileName, false);
			}
		}
	}
	
	return cmd;
}

void SaveState::onGameEnded(FileData* game)
{
	if (slot == -1) return;
	if (slot == -2) return;

	if (!mNewSlotCheckSum.empty() && Utils::FileSystem::exists(mNewSlotFile))
	{
		// Check if the file in the slot has changed. If it's the same, then delete it & clear the slot
		auto fileChecksum = ApiSystem::getInstance()->getMD5(mNewSlotFile, false);
		if (fileChecksum == mNewSlotCheckSum)
			Utils::FileSystem::removeFile(mNewSlotFile);
	}

	if (!mAutoFileBackup.empty())
	{
		Utils::FileSystem::removeFile(mAutoFileBackup);
		Utils::FileSystem::renameFile(mAutoFileBackup + ".bak", mAutoFileBackup);
	}

	if (!mAutoImageBackup.empty())
	{
		Utils::FileSystem::removeFile(mAutoImageBackup);
		Utils::FileSystem::renameFile(mAutoImageBackup + ".bak", mAutoImageBackup);
	}

	if (!mAutoMetaBackup.empty())
	{
		Utils::FileSystem::removeFile(mAutoMetaBackup);
		Utils::FileSystem::renameFile(mAutoMetaBackup + ".bak", mAutoMetaBackup);
	}

	if (SystemConf::getIncrementalSaveStates())
		SaveStateRepository::renumberSlots(game);
}

void SaveState::remove() const
{
	if (!isSlotValid())
		return;

	if (!fileName.empty())
		Utils::FileSystem::removeFile(fileName);

	if (!getScreenShot().empty())
		Utils::FileSystem::removeFile(getScreenShot());
}

bool SaveState::copyToSlot(int slot, bool move) const
{
	if (slot < 0)
		return false;

	if (!Utils::FileSystem::exists(fileName))
		return false;

	std::string destState = makeStateFilename(slot);
	
	if (move)
	{
		Utils::FileSystem::renameFile(fileName, destState);
		if (!getScreenShot().empty())
			Utils::FileSystem::renameFile(getScreenShot(), destState + ".png");
		if (hasMeta())
			Utils::FileSystem::renameFile(getMetaPath(), destState + ".json");
	}
	else
	{
		Utils::FileSystem::copyFile(fileName, destState);
		if (!getScreenShot().empty())
			Utils::FileSystem::copyFile(getScreenShot(), destState + ".png");
		if (hasMeta())
			Utils::FileSystem::copyFile(getMetaPath(), destState + ".json");
	}

	return true;
}

