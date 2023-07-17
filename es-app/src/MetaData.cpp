#include "MetaData.h"

#include "utils/FileSystemUtil.h"
#include "utils/StringUtil.h"
#include "Log.h"
#include <pugixml/src/pugixml.hpp>
#include "SystemData.h"
#include "LocaleES.h"
#include "Settings.h"
#include "FileData.h"
#include "ImageIO.h"

MetaDataDecl mInvalidMetaDataDecl(Invalid, "", MD_INVALID, "", true, "", "", false, false);
std::vector<MetaDataDecl> MetaDataList::mMetaDataDecls;

static std::map<MetaDataId, int> mMetaDataIndexes;
static std::string* mDefaultGameMap = nullptr;
static MetaDataType* mGameTypeMap = nullptr;
static std::map<std::string, MetaDataId> mGameIdMap;

static std::map<std::string, int> KnowScrapersIds =
{
	{ "ScreenScraper", 0 },
	{ "TheGamesDB", 1 },
	{ "HfsDB", 2 },
	{ "ArcadeDB", 3 }
};

void MetaDataList::initMetadata()
{
	MetaDataDecl gameDecls[] = 
	{
		// key,             type,                   default,            statistic,  name in GuiMetaDataEd,  prompt in GuiMetaDataEd
		{ Name,             "name",        MD_STRING,              "",                 false,      _("Name"),                 _("displaying game title"),	true },
		{ Title,      		"title",       MD_STRING,              "",                 false,      _("Strict Title"),		  _("strict game title"),		false },
		{ SortName,         "sortname",    MD_STRING,              "",                 false,      _("Sortable Title"),       _("sortable game title"),		true },
		{ Family,           "family",      MD_STRING,              "",                 false,      _("Game Family"),		  _("this game's game family"),		false },
		{ Desc,             "desc",        MD_MULTILINE_STRING,    "",                 false,      _("Description"),          _("this game's description"),		true },

		{ Rating,           "rating",      MD_RATING,              "0",                false,      _("Rating"),               _("grading score"),            false },
		{ Runnable,         "runnable",    MD_BOOL,                "false",            false,      _("Runnable"),             _("can start this game"),     false },
		{ Favorite,         "favorite",    MD_BOOL,                "false",            false,      _("Favorite"),             _("collection in favorite"),  false },
		{ Hidden,           "hidden",      MD_BOOL,                "false",            false,      _("Hidden"),               _("hidden from game list"),   true },
		{ KidGame,          "kidgame",     MD_BOOL,                "false",            false,      _("Kid's Game"),           _("enabled in kid mode"),     false },

#if WIN32 && !_DEBUG
		{ Emulator,         "emulator",    MD_LIST,                "",                 false,      _("Emulator"),             _("emulator"),					false },
		{ Core,             "core",	       MD_LIST,                "",                 false,      _("Core"),                 _("core"),						false },
#else
		// Windows & recalbox gamelist.xml compatiblity -> Set as statistic to hide it from metadata editor
		{ Emulator,         "emulator",    MD_LIST,	               "",                 true,       _("Emulator"),             _("emulator"),					false },
		{ Core,             "core",	       MD_LIST,	               "",                 true,       _("Core"),                 _("core"),						false },
#endif
		{ Crc32,            "crc32",       MD_STRING,              "",                 true,       _("CRC32"),                _("CRC32 checksum"),			false },
		{ Md5,              "md5",		   MD_STRING,              "",                 true,       _("MD5"),                  _("MD5 checksum"),			false },

		{ Thumbnail,        "thumbnail",   MD_PATH,                "",                 false,      _("Thumbnail"),            _("enter path to thumbnail"),		 false },
		{ Image,            "image",       MD_PATH,                "",                 false,      _("Image"),                _("enter path to image"),		 true },
		{ TitleShot,        "titleshot",   MD_PATH,                "",                 false,      _("Title Shot"),           _("enter path to title shot"), true },
		{ Ingame,			"ingame",	   MD_PATH,                "",                 false,      _("Ingame Shot"),		  _("enter path to ingame shot"), true },
		{ Outgame,			"outgame",	   MD_PATH,                "",                 false,      _("Outgame Shot"),         _("enter path to outgame shot"), true },
		{ Visual,			"visual",	   MD_PATH,                "",                 false,      _("Visual Shot"),          _("enter path to visual shot"), true },
		{ Video,            "video",       MD_PATH,                "",                 false,      _("Video"),                _("enter path to video"),		 false },

		{ Region,           "region",      MD_STRING,              "",                 false,      _("Region"),               _("this game's region"),					false },
		{ Language,         "lang",        MD_STRING,              "",                 false,      _("Languages"),            _("this game's languages"),				false },
		{ ReleaseDate,      "releasedate", MD_DATE,                "not-a-date-time",  false,      _("Release Date"),         _("enter release date"),		false },
		{ Developer,        "developer",   MD_STRING,              "",                 false,      _("Developer"),            _("this game's developer"),	false },
		{ Publisher,        "publisher",   MD_STRING,              "",                 false,      _("Publisher"),            _("this game's publisher"),	false },

		{ ArcadeSystemName, "arcadesystemname",  MD_STRING,        "",                 false,      _("Powered by"),           _("arcade system, attachment, etc."), false },
		{ Genre,            "genre",       MD_STRING,              "",                 false,      _("Genre"),                _("enter game genre"),		false }, 
		{ GenreIds,         "genres",      MD_STRING,              "",                 false,      _("Genre IDs"),            _("enter game genres"),		false },
		{ Players,          "players",     MD_STRING,              "",                 false,      _("Players"),              _("this game's number of players"),	false },
		{ Premise,          "premise",     MD_MULTILINE_STRING,    "",                 false,      _("Premise"),              _("premise for this game"),	false },
		{ Story,            "story",       MD_MULTILINE_STRING,    "",                 false,      _("Story"),                _("this game's story"),		false },
		{ Rule,             "rule",        MD_MULTILINE_STRING,    "",                 false,      _("Rule"),                 _("this game's rule"),		false },
		{ Operation,        "operation",   MD_MULTILINE_STRING,    "",                 false,      _("Operation"),            _("how to play"),             false },
		{ Credit,           "credit",      MD_MULTILINE_STRING,    "",                 false,      _("Credit"),               _("this game's staff"),       false },
		{ Tips,             "tips",        MD_MULTILINE_STRING,    "",                 false,      _("Tips"),                 _("useful something"),        false },
		{ Notes,            "notes",       MD_MULTILINE_STRING,    "",                 false,      _("Notes"),                _("miscellaneous something"),        false },
		{ Bugs,             "bugs",        MD_MULTILINE_STRING,    "",                 false,      _("Bugs"),                 _("problem info"),            false },

		{ Bezel,            "bezel",       MD_PATH,                "",                 false,      _("Bezel (16:9)"),         _("enter path to bezel (16:9)"),	 true },
		{ Marquee,          "marquee",     MD_PATH,                "",                 false,      _("Logo"),                 _("enter path to logo"),	     true },
		{ BoxArt,			"boxart",	   MD_PATH,                "",                 false,      _("Box Face"),		      _("enter path to alt boxart"), true },
		{ BoxBack,			"boxback",	   MD_PATH,                "",                 false,      _("Box Backside"),		  _("enter path to box background"), true },
		{ Cartridge,        "cartridge",   MD_PATH,                "",                 false,      _("Cartridge"),            _("enter path to cartridge"),  true },
		{ Cabinet,			"cabinet",	   MD_PATH,                "",                 false,      _("PCB"),		  		  _("enter path to pcb"), true },
		{ PCB,				"pcb",	       MD_PATH,                "",                 false,      _("PCB"),		  		  _("enter path to pcb"), true },
		{ Flyer,			"flyer",	   MD_PATH,                "",                 false,      _("Flyer"),		  		  _("enter path to flyer"), true },
		{ InstCard,			"instcard",	   MD_PATH,                "",                 false,      _("Inst Card"),		  	  _("enter path to instruction card"), true },
		{ Wheel,			"wheel",	   MD_PATH,                "",                 false,      _("Wheel"),		          _("enter path to wheel"),      true },
		{ FanArt,           "fanart",      MD_PATH,                "",                 false,      _("Fan Art"),              _("enter path to fanart"),	 true },
		{ Mix,			    "mix",	       MD_PATH,                "",                 false,      _("Mix"),                  _("enter path to mix"),		 true },

		{ Map,			    "map",	       MD_PATH,                "",                 false,      _("Map"),                  _("enter path to map"),		 true },
		{ Manual,			"manual",	   MD_PATH,                "",                 false,      _("Manual"),               _("enter path to manual"),     true },
		{ Magazine,			"magazine",	   MD_PATH,                "",                 false,      _("Magazine"),             _("enter path to magazine"),     true },

		{ PlayCount,        "playcount",   MD_INT,                 "0",                true,       _("Play Count"),           _("enter number of times played"), false },
		{ LastPlayed,       "lastplayed",  MD_TIME,                "0",                true,       _("Last Played"),          _("enter last played date"), false },
		{ GameTime,         "gametime",    MD_INT,                 "0",                true,       _("Game Time"),            _("how long the game has been played in total (seconds)"), false },

		{ CheevosHash,      "cheevosHash", MD_STRING,              "",                 true,       _("Cheevos Hash"),          _("Cheevos checksum"),	    false },
		{ CheevosId,        "cheevosId",   MD_INT,                 "",				   true,       _("Cheevos Game ID"),       _("Cheevos Game ID"),		false },

		{ ScraperId,        "id",		   MD_INT,                 "",				   true,       _("Screenscraper Game ID"), _("Screenscraper Game ID"),	false, true }
	};
	
	mMetaDataDecls = std::vector<MetaDataDecl>(gameDecls, gameDecls + sizeof(gameDecls) / sizeof(gameDecls[0]));
	
	mMetaDataIndexes.clear();
	for (int i = 0 ; i < mMetaDataDecls.size() ; i++)
		mMetaDataIndexes[mMetaDataDecls[i].id] = i;

	int maxID = MetaDataId::Max;

	if (mDefaultGameMap != nullptr) 
		delete[] mDefaultGameMap;

	if (mGameTypeMap != nullptr) 
		delete[] mGameTypeMap;

	mDefaultGameMap = new std::string[maxID];
	mGameTypeMap = new MetaDataType[maxID];

	for (int i = 0; i < maxID; i++)
		mGameTypeMap[i] = MD_STRING;
		
	for (auto iter = mMetaDataDecls.cbegin(); iter != mMetaDataDecls.cend(); iter++)
	{
		mDefaultGameMap[iter->id] = iter->defaultValue;
		mGameTypeMap[iter->id] = iter->type;
		mGameIdMap[iter->key] = iter->id;
	}
}

const MetaDataDecl& MetaDataList::getDecl(MetaDataId id)
{
	auto it = mMetaDataIndexes.find(id);
	if (it == mMetaDataIndexes.cend()) return mInvalidMetaDataDecl;
	return mMetaDataDecls[it->second];
}

const MetaDataDecl& MetaDataList::getDecl(const std::string& key)
{
	auto it = mGameIdMap.find(key);
	if (it == mGameIdMap.cend()) return mInvalidMetaDataDecl;
	return getDecl(it->second);
}

MetaDataType MetaDataList::getType(MetaDataId id) const
{
	return mGameTypeMap[id];
}

MetaDataType MetaDataList::getType(const std::string name) const
{
	return getType(getId(name));
}

MetaDataId MetaDataList::getId(const std::string& key) const
{
	return mGameIdMap[key];
}

MetaDataList::MetaDataList(MetaDataListType type) : mType(type), mWasChanged(false), mRelativeTo(nullptr)
{

}

void MetaDataList::init(SystemData* system, FileData* file)
{
	mRelativeTo = system;	
	mTargetFile = file;
}

void MetaDataList::loadFromXML(MetaDataListType type, pugi::xml_node& node, SystemData* system)
{
	mType = type;
	mRelativeTo = system;	

	mUnKnownElements.clear();
	mScrapeDates.clear();

	std::string value;
	std::string relativeTo = mRelativeTo->getStartPath();

	bool preloadMedias = Settings::PreloadMedias();
	if (preloadMedias && Settings::ParseGamelistOnly())
		preloadMedias = false;

	for (pugi::xml_node xelement : node.children())
	{
		std::string name = xelement.name();

		if (name == "scrap")
		{
			if (xelement.attribute("name") && xelement.attribute("date"))
			{
				auto scraperId = KnowScrapersIds.find(xelement.attribute("name").value());
				if (scraperId == KnowScrapersIds.cend())
					continue;
				
				Utils::Time::DateTime dateTime(xelement.attribute("date").value());
				if (!dateTime.isValid())
					continue;
								
				mScrapeDates[scraperId->second] = dateTime;
			}		
								
			continue;
		}

		auto it = mGameIdMap.find(name);
		if (it == mGameIdMap.cend())
		{
			if (name == "hash" || name == "path")
				continue;

			value = xelement.text().get();
			if (!value.empty())
				mUnKnownElements.push_back(std::tuple<std::string, std::string, bool>(name, value, true));

			continue;
		}

		MetaDataDecl& mdd = mMetaDataDecls[mMetaDataIndexes[it->second]];
		if (mdd.isAttribute)
			continue;

		value = xelement.text().get();

		if (mdd.id == MetaDataId::Name)
		{
			mName = value;
			continue;
		}

		if (value == mdd.defaultValue)
			continue;

		if (mdd.type == MD_BOOL)
			value = Utils::String::toLower(value);
		
		if (preloadMedias && mdd.type == MD_PATH && (mdd.id == MetaDataId::Image || mdd.id == MetaDataId::Thumbnail || mdd.id == MetaDataId::Marquee || mdd.id == MetaDataId::Video) &&
			!Utils::FileSystem::exists(Utils::FileSystem::resolveRelativePath(value, getScraperDir(), true)))
			continue;
		
		// Players -> remove "1-"
		if (type == GAME_METADATA && mdd.id == MetaDataId::Players && Utils::String::startsWith(value, "1-"))
			value = Utils::String::replace(value, "1-", "");

		set(mdd.id, value);
	}

	for (pugi::xml_attribute xattr : node.attributes())
	{
		std::string name = xattr.name();
		auto it = mGameIdMap.find(name);
		if (it == mGameIdMap.cend())
		{
			value = xattr.value();
			if (!value.empty())
				mUnKnownElements.push_back(std::tuple<std::string, std::string, bool>(name, value, false));

			continue;
		}

		MetaDataDecl& mdd = mMetaDataDecls[mMetaDataIndexes[it->second]];
		if (!mdd.isAttribute)
			continue;

		value = xattr.value();

		if (value == mdd.defaultValue)
			continue;

		if (mdd.type == MD_BOOL)
			value = Utils::String::toLower(value);

		// Players -> remove "1-"
		if (type == GAME_METADATA && mdd.id == MetaDataId::Players && Utils::String::startsWith(value, "1-"))
			value = Utils::String::replace(value, "1-", "");

		if (mdd.id == MetaDataId::Name)
			mName = value;
		else
			set(mdd.id, value);
	}
}

// Add migration for alternative formats & old tags
void MetaDataList::migrate(FileData* file, pugi::xml_node& node)
{
	if (get(MetaDataId::Crc32).empty())
	{
		pugi::xml_node xelement = node.child("hash");
		if (xelement)
			set(MetaDataId::Crc32, xelement.text().get());
	}
}

void MetaDataList::complement(const std::string& key, const std::vector<std::string>& extlist){

	auto path = get(key);
	if (path != ""){
		if(Utils::FileSystem::exists(path))return;
		mMap.erase(getId(key));
		mWasChanged = true;
	}

	bool f=false;
	for(auto& it: extlist){
		path = mTargetFile->getScraperPathPrefix() + key + *&it;

		if(!Utils::FileSystem::exists(path))continue;
		set(key,path);
		f=true;
	}
}

void MetaDataList::complement_image(const std::string& key){
	std::vector<std::string> extlist={ ".png", ".jpg" };
	complement(key,extlist);
}

void MetaDataList::complement_video(const std::string& key){
	std::vector<std::string> extlist={ ".mp4", ".avi", ".mkv", ".webm" };
	complement(key,extlist);
}

void MetaDataList::complement_document(const std::string& key){
	std::vector<std::string> extlist={ ".pdf" };
	complement(key,extlist);
}

void MetaDataList::complement()
{
	complement_image("image");
	complement_video("video");
	complement_image("marquee");
	complement_image("thumbnail");
	complement_image("fanart");
	complement_image("titleshot");
	complement_document("manual");
	complement_document("magazine");
	complement_image("map");
	complement_image("bezel");
	complement_image("cartridge");
	complement_image("boxart");
	complement_image("boxback");
	complement_image("wheel");
	complement_image("cabinet");
	complement_image("pcb");
	complement_image("flyer");
	complement_image("instcard");
	complement_image("ingame");
}

void MetaDataList::appendToXML(pugi::xml_node& parent, bool ignoreDefaults, const std::string& relativeTo, bool fullPaths) const
{
	const std::vector<MetaDataDecl>& mdd = getMDD();

	for(auto mddIter = mdd.cbegin(); mddIter != mdd.cend(); mddIter++)
	{
		if (mddIter->id == 0)
		{
			parent.append_child("name").text().set(mName.c_str());
			continue;
		}

		auto mapIter = mMap.find(mddIter->id);
		if(mapIter != mMap.cend())
		{
			// we have this value!
			// if it's just the default (and we ignore defaults), don't write it
			if (ignoreDefaults && mapIter->second == mddIter->defaultValue)
				continue;

			// try and make paths relative if we can
			std::string value = mapIter->second;
			if (mddIter->type == MD_PATH)
			{
				if (fullPaths && mRelativeTo != nullptr)
					value = Utils::FileSystem::resolveRelativePath(value, getScraperDir(), true);
				else
					value = Utils::FileSystem::createRelativePath(value, relativeTo, true);
			}
						
			if (mddIter->isAttribute)
				parent.append_attribute(mddIter->key.c_str()).set_value(value.c_str());
			else
				parent.append_child(mddIter->key.c_str()).text().set(value.c_str());
		}
	}

	for (std::tuple<std::string, std::string, bool> element : mUnKnownElements)
	{	
		bool isElement = std::get<2>(element);
		if (isElement)
			parent.append_child(std::get<0>(element).c_str()).text().set(std::get<1>(element).c_str());
		else 
			parent.append_attribute(std::get<0>(element).c_str()).set_value(std::get<1>(element).c_str());
	}

	if (mScrapeDates.size() > 0)
	{
		for (auto scrapeDate : mScrapeDates)
		{
			std::string name;

			for (auto sids : KnowScrapersIds)
			{
				if (sids.second == scrapeDate.first)
				{
					name = sids.first;
					break;
				}
			}

			if (!name.empty())
			{
				auto scraper = parent.append_child("scrap");
				scraper.append_attribute("name").set_value(name.c_str());
				scraper.append_attribute("date").set_value(scrapeDate.second.getIsoString().c_str());
			}
		}
	}
}

void MetaDataList::set(MetaDataId id, const std::string& value)
{
	if (id == MetaDataId::Name)
	{
		if (mName == value)
			return;

		mName = value;
		mWasChanged = true;
		return;
	}

	// Players -> remove "1-"
	if (mType == GAME_METADATA && id == 12 && Utils::String::startsWith(value, "1-")) // "players"
	{
		mMap[id] = Utils::String::replace(value, "1-", "");
		return;
	}

	auto prev = mMap.find(id);
	if (prev != mMap.cend() && prev->second == value)
		return;

	if (mGameTypeMap[id] == MD_PATH && mRelativeTo != nullptr) // if it's a path, resolve relative paths				
		mMap[id] = Utils::FileSystem::createRelativePath(value, getScraperDir(), true);
	else
		mMap[id] = Utils::String::trim(value);

	mWasChanged = true;
}

const std::string MetaDataList::get(MetaDataId id, bool resolveRelativePaths) const
{
	if (id == MetaDataId::Name)
		return mName;

	auto it = mMap.find(id);
	if (it != mMap.end())
	{
		if (resolveRelativePaths && mGameTypeMap[id] == MD_PATH && mRelativeTo != nullptr) // if it's a path, resolve relative paths				
			return Utils::FileSystem::resolveRelativePath(it->second, getScraperDir(), true);

		return it->second;
	}

	return mDefaultGameMap[id];
}

void MetaDataList::set(const std::string& key, const std::string& value)
{
	if (mGameIdMap.find(key) == mGameIdMap.cend())
		return;

	set(getId(key), value);
}

const std::string MetaDataList::get(const std::string& key, bool resolveRelativePaths) const
{
	if (mGameIdMap.find(key) == mGameIdMap.cend())
		return "";

	return get(getId(key), resolveRelativePaths);
}

int MetaDataList::getInt(MetaDataId id) const
{
	return atoi(get(id).c_str());
}

float MetaDataList::getFloat(MetaDataId id) const
{
	return Utils::String::toFloat(get(id));
}

bool MetaDataList::wasChanged() const
{
	return mWasChanged;
}

void MetaDataList::resetChangedFlag()
{
	mWasChanged = false;
}

void MetaDataList::importScrappedMetadata(const MetaDataList& source)
{
	int type = MetaDataImportType::Types::ALL;

	if (Settings::getInstance()->getString("Scraper") == "ScreenScraper")
	{
		if (Settings::getInstance()->getString("ScrapperImageSrc").empty())
			type &= ~MetaDataImportType::Types::IMAGE;

		if (Settings::getInstance()->getString("ScrapperThumbSrc").empty())
			type &= ~MetaDataImportType::Types::THUMB;

		if (Settings::getInstance()->getString("ScrapperLogoSrc").empty())
			type &= ~MetaDataImportType::Types::MARQUEE;

		if (!Settings::getInstance()->getBool("ScrapeVideos"))
			type &= ~MetaDataImportType::Types::VIDEO;

		if (!Settings::getInstance()->getBool("ScrapeFanart"))
			type &= ~MetaDataImportType::Types::FANART;

		if (!Settings::getInstance()->getBool("ScrapeBoxBack"))
			type &= ~MetaDataImportType::Types::BOXBACK;

		if (!Settings::getInstance()->getBool("ScrapeTitleShot"))
			type &= ~MetaDataImportType::Types::TITLESHOT;

		if (!Settings::getInstance()->getBool("ScrapeMap"))
			type &= ~MetaDataImportType::Types::MAP;

		if (!Settings::getInstance()->getBool("ScrapeManual"))
			type &= ~MetaDataImportType::Types::MANUAL;

		if (!Settings::getInstance()->getBool("ScrapeCartridge"))
			type &= ~MetaDataImportType::Types::CARTRIDGE;		
	}

	for (auto mdd : getMDD())
	{
		if (mdd.isStatistic && mdd.id != MetaDataId::ScraperId)
			continue;

		if (mdd.id == MetaDataId::KidGame) // Not scrapped yet
			continue;

		if (mdd.id == MetaDataId::Region || mdd.id == MetaDataId::Language) // Not scrapped
			continue;

		if (mdd.id == MetaDataId::Favorite || mdd.id == MetaDataId::Hidden || mdd.id == MetaDataId::Emulator || mdd.id == MetaDataId::Core)
			continue;

		if (mdd.id == MetaDataId::Image && (source.get(mdd.id).empty() || (type & MetaDataImportType::Types::IMAGE) != MetaDataImportType::Types::IMAGE))
			continue;		

		if (mdd.id == MetaDataId::Thumbnail && (source.get(mdd.id).empty() || (type & MetaDataImportType::Types::THUMB) != MetaDataImportType::Types::THUMB))
			continue;

		if (mdd.id == MetaDataId::Marquee && (source.get(mdd.id).empty() || (type & MetaDataImportType::Types::MARQUEE) != MetaDataImportType::Types::MARQUEE))
			continue;

		if (mdd.id == MetaDataId::Video && (source.get(mdd.id).empty() || (type & MetaDataImportType::Types::VIDEO) != MetaDataImportType::Types::VIDEO))
			continue;

		if (mdd.id == MetaDataId::TitleShot && (source.get(mdd.id).empty() || (type & MetaDataImportType::Types::TITLESHOT) != MetaDataImportType::Types::TITLESHOT))
			continue;

		if (mdd.id == MetaDataId::FanArt && (source.get(mdd.id).empty() || (type & MetaDataImportType::Types::FANART) != MetaDataImportType::Types::FANART))
			continue;

		if (mdd.id == MetaDataId::BoxBack && (source.get(mdd.id).empty() || (type & MetaDataImportType::Types::BOXBACK) != MetaDataImportType::Types::BOXBACK))
			continue;

		if (mdd.id == MetaDataId::Map && (source.get(mdd.id).empty() || (type & MetaDataImportType::Types::MAP) != MetaDataImportType::Types::MAP))
			continue;

		if (mdd.id == MetaDataId::Manual && (source.get(mdd.id).empty() || (type & MetaDataImportType::Types::MANUAL) != MetaDataImportType::Types::MANUAL))
			continue;

		if (mdd.id == MetaDataId::Cartridge && (source.get(mdd.id).empty() || (type & MetaDataImportType::Types::CARTRIDGE) != MetaDataImportType::Types::CARTRIDGE))
			continue;

		if (mdd.id == MetaDataId::Rating && source.getFloat(mdd.id) < 0)
			continue;

		set(mdd.id, source.get(mdd.id));


		if (mdd.type == MetaDataType::MD_PATH)
		{
			ImageIO::removeImageCache(source.get(mdd.id));

			unsigned int x, y;
			ImageIO::loadImageSize(source.get(mdd.id).c_str(), &x, &y);
		}
	}

	if (Utils::String::startsWith(source.getName(), "ZZZ(notgame)"))
		set(MetaDataId::Hidden, "true");
}

std::string MetaDataList::getRelativeRootPath()
{
	if (mRelativeTo)
		return mRelativeTo->getStartPath();

	return "";
}

std::string MetaDataList::getScraperDir() const{

	return mTargetFile->getScraperDir();
}

void MetaDataList::setScrapeDate(const std::string& scraper)
{
	auto it = KnowScrapersIds.find(scraper);
	if (it == KnowScrapersIds.cend())
		return;

	mScrapeDates[it->second] = Utils::Time::DateTime::now();
	mWasChanged = true;
}

Utils::Time::DateTime* MetaDataList::getScrapeDate(const std::string& scraper)
{
	auto it = KnowScrapersIds.find(scraper);
	if (it != KnowScrapersIds.cend())
	{
		auto itd = mScrapeDates.find(it->second);
		if (itd != mScrapeDates.cend())
			return &itd->second;
	}

	return nullptr;
}

bool MetaDataList::isSlideShowAvailable(){
	auto path=Utils::FileSystem::resolveRelativePath("./slideshow", getScraperDir(), true);
	return Utils::FileSystem::isDirectory(path);
}

bool MetaDataList::isJukeBoxAvailable(){
	auto path=Utils::FileSystem::resolveRelativePath("./jukebox", getScraperDir(), true);
	return Utils::FileSystem::isDirectory(path);
}

bool MetaDataList::isDocumentationAvailable(){
	auto path=Utils::FileSystem::resolveRelativePath("./docs.json", getScraperDir(), true);
	return Utils::FileSystem::isRegularFile(path);
}
