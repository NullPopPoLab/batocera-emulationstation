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
	s=Utils::FileSystem::createRelativePath_undot(path,s,false);
	s=Utils::FileSystem::changeExtension(s,"");
	if (Utils::String::endsWith(s, ".state")) s = Utils::FileSystem::getStem(s);
	return s;
}
	
void SaveStateRepository::refresh(const std::string& path)
{
	clear();

	if (!Utils::FileSystem::exists(path))
		return;
	
	auto files = Utils::FileSystem::getDirectoryFiles(path);
	for (auto file : files)
	{
		if (file.hidden)
			continue;
		if (file.directory){
			refresh(file.path);
			continue;
		}

		std::string ext = Utils::String::toLower(Utils::FileSystem::getExtension(file.path));

		if (ext == ".bak")
		{
			// auto ffstem = Utils::FileSystem::combine(Utils::FileSystem::getParent(file.path), Utils::FileSystem::getStem(file.path));
			// Utils::FileSystem::removeFile(ffstem);
			// Utils::FileSystem::renameFile(file.path, ffstem);
			// TODO RESTORE BAK FILE !? If board was turned off during a game ?
		}

		if (ext != ".auto" && !Utils::String::startsWith(ext, ".state"))
			continue;

		SaveState* state = new SaveState();

		if (ext == ".auto")
			state->slot = -1;
		else if (Utils::String::startsWith(ext, ".state"))
			state->slot = Utils::String::toInteger(ext.substr(6));

		auto stem = getSaveName(file.path);
				
		state->rom = stem;
		state->fileName = file.path;

#if WIN32
		state->creationDate.setTime(file.lastWriteTime);
#else
		state->creationDate = Utils::FileSystem::getFileModificationDate(state->fileName);
#endif

		mStates[stem].push_back(state);
	}
}

void SaveStateRepository::refresh()
{
	refresh(getSavesPath());
}

bool SaveStateRepository::hasSaveStates(FileData* game)
{
	if (mStates.size())
	{
		if (game->getSourceFileData()->getSystem() != mSystem)
			return false;

		auto name=game->getPathKey();
		auto it = mStates.find(name);
		if (it != mStates.cend())
			return true;
	}

	return false;
}
std::vector<SaveState*> SaveStateRepository::getSaveStates(FileData* game)
{
	if (isEnabled(game) && game->getSourceFileData()->getSystem() == mSystem)
	{
		auto name=game->getPathKey();
		auto it = mStates.find(name);
		if (it != mStates.cend())
			return it->second;
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
