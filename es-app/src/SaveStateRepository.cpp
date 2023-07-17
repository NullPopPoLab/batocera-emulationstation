#include "SaveStateRepository.h"
#include "SystemData.h"
#include "FileData.h"
#include "utils/StringUtil.h"

#include <time.h>
#include "Paths.h"

#if WIN32
#include "Win32ApiSystem.h"
#endif

SaveStateRepository::SaveStateRepository(SystemData* system)
{
	mSystem = system;
	refresh();
}

SaveStateRepository::~SaveStateRepository()
{
	clear();
}

void SaveStateRepository::clear()
{
	for (auto item : mStates)
		for (auto state : item.second)
			delete state;

	mStates.clear();
}

std::string SaveStateRepository::getSavesPath()
{
	return Utils::FileSystem::combine(Paths::getSavesPath(), mSystem->getName());
}

std::string SaveStateRepository::getSaveName(const std::string& path)
{
	auto s=getSavesPath();
	s=Utils::FileSystem::createRelativePath(path,s,false);
	s=Utils::FileSystem::getParent(s);
	s=Utils::FileSystem::createRelativePath_undot(s,s,false);
//	s=Utils::FileSystem::changeExtension(s,"");
//	if (Utils::String::endsWith(s, ".state")) s = Utils::FileSystem::getStem(s);
	return s;
}
	
void SaveStateRepository::refresh(const std::string& base, const std::string& path)
{
	if (!Utils::FileSystem::exists(path))
		return;
	
	auto l0=base.size();
	auto l1=path.size();
	auto gname=path.substr(l0+1);

	auto files = Utils::FileSystem::getDirectoryFiles(path);
	for (auto file : files)
	{
		if (file.hidden)
			continue;
		if (file.directory)
			continue;

		std::string lowpath=Utils::String::toLower(file.path);
		std::string ext = Utils::FileSystem::getExtension(lowpath);

		if (ext == ".bak")
		{
			// auto ffstem = Utils::FileSystem::combine(Utils::FileSystem::getParent(file.path), Utils::FileSystem::getStem(file.path));
			// Utils::FileSystem::removeFile(ffstem);
			// Utils::FileSystem::renameFile(file.path, ffstem);
			// TODO RESTORE BAK FILE !? If board was turned off during a game ?
		}

		int slot=0;
		std::string stem = Utils::FileSystem::getStem(lowpath);

		if (ext == ".auto")
			slot = -1;
		else if (ext=="" && Utils::String::startsWith(stem, "state"))
			slot = Utils::String::toInteger(stem.substr(5));
		else continue;

		SaveState* state = new SaveState(this);
		state->slot = slot;


		state->rom = gname;
		state->fileName = file.path;

#if WIN32
		state->creationDate.setTime(file.lastWriteTime);
#else
		state->creationDate = Utils::FileSystem::getFileModificationDate(state->fileName);
#endif

		mStates[gname].push_back(state);
	}
}

void SaveStateRepository::refresh()
{
	clear();

	auto path=getSavesPath();
	auto files = Utils::FileSystem::getDirectoryFiles(path);
	for (auto file : files)
	{
		if (!file.directory)
			continue;
		if (file.hidden)
			continue;

		refresh(path,file.path);
	}
}

bool SaveStateRepository::hasSaveStates(FileData* game)
{
	SystemData* gsys=game->getSourceFileData()->getSystem();
	if (gsys != mSystem){
		return false;
	}

	auto name=game->getGameKey();
	if (!mStates.size()){
		return false;
	}

	{
		auto it = mStates.find(name);
		if (it != mStates.cend()){
			return true;
		}
	}

	return false;
}
std::vector<SaveState*> SaveStateRepository::getSaveStates(FileData* game)
{
	SystemData* gsys=game->getSourceFileData()->getSystem();
	if (gsys != mSystem){
		return std::vector<SaveState*>();
	}

	auto name=game->getGameKey();
	if(!isEnabled(game)){
		return std::vector<SaveState*>();
	}

	{
		auto it = mStates.find(name);
		if (it != mStates.cend()){
			return it->second;
		}
	}

	return std::vector<SaveState*>();
}

bool SaveStateRepository::isEnabled(FileData* game)
{
	auto emulatorName = game->getEmulator();
	if (emulatorName != "libretro" && emulatorName != "angle" && !Utils::String::startsWith(emulatorName, "lr-"))
		return false;

	if (!game->isFeatureSupported(EmulatorFeatures::autosave))
		return false;

	auto system = game->getSourceFileData()->getSystem();
	if (system->getSaveStateRepository()->getSavesPath().empty())
		return false;
	
	if (system->hasPlatformId(PlatformIds::IMAGEVIEWER))
		return false;

	return true;
}

int SaveStateRepository::getNextFreeSlot(FileData* game)
{
	if (!isEnabled(game))
		return -99;
	
	auto repo = game->getSourceFileData()->getSystem()->getSaveStateRepository();
	auto states = repo->getSaveStates(game);
	if (states.size() == 0)
		return 0;

	for (int i = 99999; i >= 0; i--)
	{
		auto it = std::find_if(states.cbegin(), states.cend(), [i](const SaveState* x) { return x->slot == i; });
		if (it != states.cend())
			return i + 1;
	}

	return -99;
}

void SaveStateRepository::renumberSlots(FileData* game)
{
	if (!isEnabled(game))
		return;

	auto repo = game->getSourceFileData()->getSystem()->getSaveStateRepository();	
	repo->refresh();

	auto states = repo->getSaveStates(game);
	if (states.size() == 0)
		return;

	std::sort(states.begin(), states.end(), [](const SaveState* file1, const SaveState* file2) { return file1->slot < file2->slot; });

	int slot = 0;

	for (auto state : states)
	{
		if (state->slot < 0)
			continue;

		if (state->slot != slot)
			state->copyToSlot(slot, true);
		
		slot++;
	}	
}
